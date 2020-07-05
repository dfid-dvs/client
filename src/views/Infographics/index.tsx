import React, { useState, useMemo } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import PrintButton from '#components/PrintButton';

import useRequest from '#hooks/useRequest';
import {
    Bbox,
    MultiResponse,
    IndicatorValue,
} from '#types';
import { apiEndPoint } from '#utils/constants';

import { OriginalFiveW } from '#views/Dashboard/types';
import DomainContext from '#components/DomainContext';
import SingleRegionSelect from '#components/SingleRegionSelect';
import Numeral from '#components/Numeral';
import infographicLogo from '#resources/infographic-logo.svg';

import InfographicsMap from './Map';

import styles from './styles.css';

interface Props {
    className?: string;
}

const numericDataList = [
    { key: 'finance', label: 'Financial institutions', value: 0 },
    { key: 'health', label: 'Health facilities', value: 0 },
    { key: 'healthPerThousand', label: 'Health facilities / 1000 person', value: 0 },
    { key: 'population', label: 'Population', value: 0 },
    { key: 'povertyGap', label: 'Poverty gap', value: 0 },
    { key: 'budget', label: 'Total budget', value: 0 },
    { key: 'programs', label: 'Programs', value: 0 },
    { key: 'partners', label: 'Partners (1st tier)', value: 0 },
    { key: 'sectors', label: 'Sectors', value: 0 },
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
    return [...new Set(list.map(d => itemSelector(d)))].reduce((acc, val) => acc + val, 0);
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
        selectedRegionBounds,
        setSelectedRegionBounds,
    ] = React.useState<Bbox | undefined>(undefined);

    const regionFiveWUrl = `${apiEndPoint}/core/fivew-${regionLevel}/`;
    const regionFiveWRequestOptions: RequestInit | undefined = React.useMemo(
        () => ({
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
        }),
        [],
    );

    // 25: estimated population
    // 133: Poverty gap
    // 118: Financial institution
    // 119: Health facilities
    // 145: Health facilities per 1000 person
    const indicatorUrl = `${apiEndPoint}/core/${regionLevel}-indicator/?indicator_id=25,54,118,119,145`;
    const indicatorRequestOptions: RequestInit | undefined = React.useMemo(
        () => ({
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
        }),
        [],
    );

    const [, indicatorResponse] = useRequest<MultiResponse<IndicatorValue>>(indicatorUrl, 'indicator', indicatorRequestOptions);

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

    const [, aggregatedFiveWResponse] = useRequest<MultiResponse<OriginalFiveW>>(regionFiveWUrl, 'fivew', regionFiveWRequestOptions);
    const regionData = React.useMemo(() => {
        const data = {
            budget: 0,
            name: 'Region',
            partners: 0,
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
            data.partners = currentRegion.partner.length;
            data.sectors = currentRegion.sector.length;
            data.subSectors = currentRegion.subSector.length;
            data.components = currentRegion.component.length;
        }

        return data;
    }, [aggregatedFiveWResponse, region]);

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
                    onRegionLevelChange={setRegionLevel}
                    regionLevel={regionLevel}
                    region={region}
                    onRegionChange={setRegion}
                    onBoundsChange={setSelectedRegionBounds}
                />
                <PrintButton
                    className={styles.printModeButton}
                    printMode={printMode}
                    onPrintModeChange={setPrintMode}
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
                                <div className={styles.parentRegionDetails}>
                                    Parent region
                                </div>
                            </div>
                            <div className={styles.appBrand}>
                                <img
                                    className={styles.logo}
                                    src={infographicLogo}
                                    alt="DFID"
                                />
                            </div>
                        </div>
                        <div className={styles.firstDetailsRow}>
                            <div className={styles.regionDetails}>
                                { numericDataList.map(d => (
                                    <NumberOutput
                                        value={
                                            regionData[d.key]
                                            || indicatorData[d.key]
                                            || d.value
                                        }
                                        label={d.label}
                                        key={d.key}
                                    />
                                ))}
                            </div>
                            <InfographicsMap
                                className={styles.mapContainer}
                                bounds={selectedRegionBounds}
                                selectedRegion={region}
                            />
                        </div>
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
