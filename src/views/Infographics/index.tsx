import React, { useCallback, useState, useMemo, useContext } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import PrintButton from '#components/PrintButton';

import useRequest from '#hooks/useRequest';
import {
    Bbox,
    RegionLevelOption,
    MultiResponse,
    IndicatorValue,
} from '#types';
import { apiEndPoint } from '#utils/constants';

import DomainContext from '#components/DomainContext';
import SingleRegionSelect, { Province, District, Municipality } from '#components/SingleRegionSelect';
import Button from '#components/Button';
import TextAreaInput from '#components/TextAreaInput';
import uiAidBEKLogo from '#resources/ukaid-bek-logo.jpg';
import useBasicToggle from '#hooks/useBasicToggle';

import InfographicsMap from './Map';
import InfographicsCharts from './Charts';
import Indicators from './Indicators';

import styles from './styles.css';
import Sectors from './Sectors';

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

type fiveWDataKey = 'componentCount' | 'programCount'
| 'sectorCount' | 'supplierCount' | 'totalBudget';

interface FiveWData {
    key: fiveWDataKey;
    label: string;
    value: number;
}

const fiveWDataList: FiveWData[] = [
    { key: 'componentCount', label: 'Components', value: 0 },
    { key: 'programCount', label: 'Programs', value: 0 },
    { key: 'sectorCount', label: 'Sectors', value: 0 },
    { key: 'supplierCount', label: 'Suppliers', value: 0 },
    { key: 'totalBudget', label: 'Total Budget', value: 0 },
];

interface FiveWDataResponse {
    componentCount: number;
    programCount: number;
    sectorCount: number;
    supplierCount: number;
    totalBudget: number;
}

interface IndicatorResponse {
    indicatordata: IndicatorValue[];
    fivewdata: FiveWDataResponse[];
    activeSectors: string[];
}

function Infographics(props: Props) {
    const { className } = props;
    const {
        regionLevel,
        setRegionLevel,
    } = useContext(DomainContext);

    const [region, setRegion] = useState<number | undefined>(undefined);
    const [printMode, setPrintMode] = useState(false);
    const [
        selectedRegionData,
        setSelectedRegionData,
    ] = useState<Region & { type: RegionLevelOption } | undefined>(undefined);
    const [showAddModal, setAddModalVisibility] = useState(false);

    const regionFiveWUrl = `${apiEndPoint}/core/fivew-${regionLevel}/`;

    const indicatorsUrl = selectedRegionData ? `${apiEndPoint}/core/profile?region=${regionLevel}&${regionLevel}_code=${+selectedRegionData.code}` : undefined;

    const [indicatorsPending, indicatorsResponse] = useRequest<IndicatorResponse>(indicatorsUrl, 'indicators');

    const indicatorsData = useMemo(
        () => indicatorsResponse?.indicatordata,
        [indicatorsResponse?.indicatordata],
    );

    const fiveWData: FiveWData[] | undefined = useMemo(
        () => {
            const fiveWResponseData = indicatorsResponse?.fivewdata;

            if (!fiveWResponseData) {
                return undefined;
            }
            const fwdData = fiveWResponseData[0];
            return fiveWDataList.map(fwd => ({
                ...fwd,
                value: fwdData[fwd.key],
            }));
        },
        [indicatorsResponse?.fivewdata],
    );

    const activeSectors: string[] | undefined = useMemo(
        () => indicatorsResponse?.activeSectors,
        [indicatorsResponse?.activeSectors],
    );

    const handleAddChartModalClick = useCallback(() => {
        setAddModalVisibility(true);
    }, [setAddModalVisibility]);

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

    const dataPending = parentRegionPending || indicatorsPending;

    const [
        indicatorsHidden,
        setIndicatorsHidden,
        unsetIndicatorsHidden,
    ] = useBasicToggle();

    const [
        sectorsHidden,
        setSectorsHidden,
        unsetSectorsHidden,
    ] = useBasicToggle();

    const resetProfileShown = indicatorsHidden || sectorsHidden;

    const onResetProfile = useCallback(
        () => {
            unsetIndicatorsHidden();
            unsetSectorsHidden();
        },
        [unsetIndicatorsHidden, unsetSectorsHidden],
    );

    const [description, setDescription] = useState('');
    const handleDescriptionChange = useCallback(
        (value: string) => {
            setDescription(value);
        },
        [setDescription],
    );
    return (
        <div
            className={_cs(
                className,
                styles.infographics,
                printMode && styles.printMode,
            )}
        >
            <div className={styles.sidebar}>
                <div className={styles.heading}>
                    Region Profile
                </div>
                <SingleRegionSelect
                    className={styles.regionSelector}
                    onRegionLevelChange={handleRegionLevelChange}
                    regionLevel={regionLevel}
                    region={region}
                    onRegionChange={handleRegionChange}
                    disabled={printMode}
                    segmentLabel="Choose Region"
                    segmentLabelClassName={styles.segmentLabel}
                    segmentInputClassName={styles.segmentInput}
                    selectInputClassName={styles.selectInput}
                    showDropDownIcon
                />
                <Button
                    className={styles.addChartButton}
                    onClick={handleAddChartModalClick}
                    disabled={printMode || isNotDefined(region)}
                    variant="secondary-outline"
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
                {resetProfileShown && (
                    <Button
                        className={styles.resetProfileButton}
                        onClick={onResetProfile}
                        disabled={printMode}
                        variant="transparent"
                    >
                        Reset Profile
                    </Button>
                )}
            </div>
            {isDefined(region) ? (
                <div className={styles.content}>
                    <div className={styles.infographicsContent}>
                        <div className={styles.headerRow}>
                            <div className={styles.basicInfo}>
                                <div className={styles.appBrand}>
                                    <img
                                        className={styles.logo}
                                        src={uiAidBEKLogo}
                                        alt="DFID"
                                    />
                                </div>
                                <div className={styles.date}>
                                    {currentDate}
                                </div>
                                <div className={styles.regionName}>
                                    { selectedRegionData?.name }
                                </div>
                                {regionLevel !== 'province' && (
                                    <div className={styles.parentRegionDetails}>
                                        {parentRegionResponse?.results[0]?.name}
                                    </div>
                                )}
                            </div>
                            <InfographicsMap
                                className={styles.mapContainer}
                                bounds={currentBounds}
                                selectedRegion={region}
                            />
                        </div>
                        {!indicatorsHidden && indicatorsData && indicatorsData.length > 0 && (
                            <Indicators
                                dataPending={dataPending}
                                setIndicatorsHidden={setIndicatorsHidden}
                                className={styles.indicators}
                                indicatorsData={indicatorsData}
                                fiveWData={fiveWData}
                            />
                        )}
                        <div className={styles.description}>
                            <TextAreaInput
                                label="Description"
                                placeholder="Write your description..."
                                autoFocus
                                value={description}
                                onChange={handleDescriptionChange}
                                className={styles.textInput}
                                inputClassName={styles.textAreaInput}
                                labelClassName={styles.label}
                            />
                        </div>
                        {!sectorsHidden && activeSectors && activeSectors.length > 0 && (
                            <Sectors
                                className={styles.sectors}
                                activeSectors={activeSectors}
                                setSectorsHidden={setSectorsHidden}
                            />
                        )}
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
