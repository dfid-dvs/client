import React, { useCallback, useState, useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
    sum,
} from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import PrintButton from '#components/PrintButton';

import useRequest from '#hooks/useRequest';
import {
    Bbox,
    RegionLevelOption,
    MultiResponse,
    IndicatorValue,
} from '#types';
import { apiEndPoint } from '#utils/constants';

import { OriginalFiveW } from '#views/Dashboard/types';
import DomainContext from '#components/DomainContext';
import SingleRegionSelect, { Province, District, Municipality } from '#components/SingleRegionSelect';
import Numeral from '#components/Numeral';
import Button from '#components/Button';
import dfidLogo from '#resources/dfid-logo.png';

import InfographicsMap from './Map';
import InfographicsCharts from './Charts';

import styles from './styles.css';

interface Props {
    className?: string;
}

interface MyProvince extends Province {
    type: 'province';
}
interface MyDistrict extends District {
    type: 'district';
}
interface MyMunicipality extends Municipality {
    type: 'municipality';
}

type Region = MyProvince | MyDistrict | MyMunicipality;

type numericDataKey = 'finance' | 'healthPerThousand' | 'population'
| 'povertyGap' | 'budget' | 'programs' | 'partners' | 'sectors';

interface NumericData {
    key: numericDataKey;
    label: string;
    value: number;
}

const numericDataList: NumericData[] = [
    { key: 'finance', label: 'Financial institutions', value: 0 },
    { key: 'healthPerThousand', label: 'Health facilities / 1000 person', value: 0 },
    { key: 'population', label: 'Population', value: 0 },
    { key: 'povertyGap', label: 'Poverty gap', value: 0 },
    { key: 'budget', label: 'Total budget', value: 0 },
    { key: 'programs', label: 'Programs', value: 0 },
    { key: 'partners', label: 'Partners (1st tier)', value: 0 },
    { key: 'sectors', label: 'Sectors', value: 0 },
    // { key: 'health', label: 'Health facilities', value: 0 },
    // { key: 'subSectors', label: 'Subsectors', value: 0 },
    // { key: 'gdp', label: 'GDP', value: 0 },
    // { key: 'perCapitaIncome', label: 'Per capita income', value: 0 },
];

function NumberOutput(p: {
    label: string;
    value: number;
}) {
    const {
        label,
        value,
    } = p;

    return (
        <div className={styles.numberOutput}>
            <Numeral
                className={styles.value}
                value={value}
                normalize
            />
            <div className={styles.label}>
                { label }
            </div>
        </div>
    );
}

interface FiveW {
    allocatedBudget: number;
    programId: number;
    supplierId: number;
    componentId: number;
}

function getAccumulatedAttributeValue<T>(list: T[], itemSelector: (el: T) => number) {
    return sum(list.map(itemSelector));
}

function Infographics(props: Props) {
    const { className } = props;
    const {
        regionLevel,
        setRegionLevel,
    } = React.useContext(DomainContext);

    const [region, setRegion] = useState<number | undefined>(undefined);
    const [printMode, setPrintMode] = useState(false);
    const [
        selectedRegionData,
        setSelectedRegionData,
    ] = React.useState<Region & { type: RegionLevelOption } | undefined>(undefined);

    const [showAddModal, setAddModalVisibility] = useState(false);

    const regionFiveWUrl = `${apiEndPoint}/core/fivew-${regionLevel}/`;

    // FIXME: use prepareUrlParams
    const indicatorUrl = `${apiEndPoint}/core/${regionLevel}-indicator/?indicator_id=25,54,118,119,145`;

    const [indicatorPending, indicatorResponse] = useRequest<MultiResponse<IndicatorValue>>(
        indicatorUrl,
        'indicator',
        undefined,
    );

    const indicatorData = useMemo(() => {
        if (indicatorResponse) {
            const indicatorList = indicatorResponse.results.filter(d => +d.code === region);

            const estimatedPopulationList = indicatorList.filter(d => d.indicatorId === 25);
            const povertyGapList = indicatorList.filter(d => d.indicatorId === 54);
            const financialInstitutionList = indicatorList.filter(d => d.indicatorId === 118);
            const healthFacilityList = indicatorList.filter(d => d.indicatorId === 119);
            const healthFacilityPerThousandList = indicatorList
                .filter(d => d.indicatorId === 145);

            const estimatedPopulation = getAccumulatedAttributeValue(
                estimatedPopulationList,
                d => d.value,
            );
            const povertyGap = getAccumulatedAttributeValue(povertyGapList, d => d.value);
            const financialInstitution = getAccumulatedAttributeValue(
                financialInstitutionList, d => d.value,
            );
            const healthFacility = getAccumulatedAttributeValue(healthFacilityList, d => d.value);
            const healthFacilityPerThousand = getAccumulatedAttributeValue(
                healthFacilityPerThousandList, d => d.value,
            );

            return {
                population: estimatedPopulation,
                povertyGap,
                finance: financialInstitution,
                health: healthFacility,
                healthPerThousand: healthFacilityPerThousand,
            };
        }

        return {};
    }, [indicatorResponse, region]);

    const handleAddChartModalClick = useCallback(() => {
        setAddModalVisibility(true);
    }, [setAddModalVisibility]);

    const [
        aggregatedFiveWPending,
        aggregatedFiveWResponse,
    ] = useRequest<MultiResponse<OriginalFiveW>>(
        regionFiveWUrl,
        `fivew-${regionLevel}`,
        undefined,
    );

    const regionData = React.useMemo(() => {
        const data = {
            budget: 0,
            name: 'Region',
            partners: 0,
            programs: 0,
            sectors: 0,
            subSectors: 0,
            components: 0,
        };

        if (!aggregatedFiveWResponse) {
            return data;
        }

        const currentRegion = aggregatedFiveWResponse.results.find(d => +d.code === region);

        if (currentRegion) {
            data.name = currentRegion.name;
            data.budget = currentRegion.allocatedBudget;
            data.programs = currentRegion.program.length;
            data.partners = currentRegion.partner.length;
            data.sectors = currentRegion.sector.length;
            data.subSectors = currentRegion.subSector.length;
            data.components = currentRegion.component.length;
        }

        return data;
    }, [aggregatedFiveWResponse, region]);

    const numericData = useMemo(() => ({
        ...indicatorData,
        ...regionData,
    }), [indicatorData, regionData]);

    const handleRegionChange = useCallback((newRegionId, newSelectedRegionData) => {
        setRegion(newRegionId);
        setSelectedRegionData({
            ...newSelectedRegionData,
            type: regionLevel,
        });
    }, [setRegion, setSelectedRegionData, regionLevel]);

    const handleRegionLevelChange = useCallback((newRegionLevel) => {
        setRegion(undefined);
        setSelectedRegionData(undefined);
        setRegionLevel(newRegionLevel);
    }, [setRegion, setSelectedRegionData, setRegionLevel]);

    const currentBounds: Bbox | undefined = useMemo(() => {
        const bounds = selectedRegionData
            ?.bbox
            ?.split(',')
            .slice(0, 4)
            .map(b => +b);

        return bounds?.length === 4
            ? bounds as Bbox
            : undefined;
    }, [selectedRegionData]);

    const url = useMemo(() => {
        if (!selectedRegionData) {
            return undefined;
        }
        if (selectedRegionData.type === 'district' && selectedRegionData.provinceId) {
            // FIXME: use prepareUrlParams
            return `${apiEndPoint}/core/province/?id=${selectedRegionData.provinceId}`;
        }
        if (selectedRegionData.type === 'municipality' && selectedRegionData.districtId) {
            // FIXME: use prepareUrlParams
            return `${apiEndPoint}/core/district/?id=${selectedRegionData.districtId}`;
        }
        return undefined;
    }, [selectedRegionData]);

    const [parentRegionPending, parentRegionResponse] = useRequest<MultiResponse<Region>>(url, 'parent-region');

    const currentDate = new Date().toDateString();

    const dataPending = parentRegionPending || indicatorPending || aggregatedFiveWPending;

    return (
        <div
            className={_cs(
                className,
                styles.infographics,
                printMode && styles.printMode,
            )}
        >
            <div className={styles.sidebar}>
                <SingleRegionSelect
                    className={styles.regionSelector}
                    onRegionLevelChange={handleRegionLevelChange}
                    regionLevel={regionLevel}
                    region={region}
                    onRegionChange={handleRegionChange}
                    disabled={printMode}
                />
                <Button
                    className={styles.addChartButton}
                    onClick={handleAddChartModalClick}
                    disabled={printMode || isNotDefined(region)}
                >
                    Add Chart
                </Button>
                <PrintButton
                    className={styles.printModeButton}
                    printMode={printMode}
                    onPrintModeChange={setPrintMode}
                    disabled={isNotDefined(region)}
                    orientation="portrait"
                />
            </div>
            {isDefined(region) ? (
                <div className={styles.content}>
                    <div className={styles.infographicsContent}>
                        <div className={styles.headerRow}>
                            <div className={styles.basicInfo}>
                                <div className={styles.regionName}>
                                    { regionData.name }
                                </div>
                                {regionLevel !== 'province' && (
                                    <div className={styles.parentRegionDetails}>
                                        {parentRegionResponse?.results[0]?.name}
                                    </div>
                                )}
                                <div className={styles.date}>
                                    {currentDate}
                                </div>
                            </div>
                            <div className={styles.appBrand}>
                                <img
                                    className={styles.logo}
                                    src={dfidLogo}
                                    alt="DFID"
                                />
                            </div>
                        </div>
                        <div className={styles.firstDetailsRow}>
                            {dataPending && (
                                <Backdrop className={styles.backdrop}>
                                    <LoadingAnimation />
                                </Backdrop>
                            )}
                            <div className={styles.regionDetails}>
                                { numericDataList.map(d => (
                                    <NumberOutput
                                        value={numericData[d.key] || 0}
                                        label={d.label}
                                        key={d.key}
                                    />
                                ))}
                            </div>
                            <InfographicsMap
                                className={styles.mapContainer}
                                bounds={currentBounds}
                                selectedRegion={region}
                            />
                        </div>
                        {regionLevel !== 'municipality' && (
                            <InfographicsCharts
                                className={styles.charts}
                                printMode={printMode}
                                showAddModal={showAddModal}
                                selectedRegion={region}
                                onAddModalVisibilityChange={setAddModalVisibility}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className={styles.noContent}>
                    Select a Region
                </div>
            )}
        </div>
    );
}
export default Infographics;
