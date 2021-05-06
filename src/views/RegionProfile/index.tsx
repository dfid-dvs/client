import React, { useCallback, useState, useMemo, useContext } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
    isFalsyString,
    compareNumber,
} from '@togglecorp/fujs';
import { IoMdClose, IoMdRefresh } from 'react-icons/io';

import PrintButton from '#components/PrintButton';

import useRequest from '#hooks/useRequest';
import {
    Bbox,
    RegionLevelOption,
    IndicatorValue,
} from '#types';
import { apiEndPoint } from '#utils/constants';

import DomainContext from '#components/DomainContext';
import SingleRegionSelect, { Province, District, Municipality } from '#components/SingleRegionSelect';
import Button from '#components/Button';
import TextAreaInput from '#components/TextAreaInput';
import DendogramTree from '#components/DendogramTree';

import uiAidBEKLogo from '#resources/ukaid-bek-logo.jpg';
import useBasicToggle from '#hooks/useBasicToggle';

import RegionProfileMap from './Map';
import RegionProfileCharts from './Charts';
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

interface ProfileChartData {
    name: string;
    id: number;
    value: number;
    key: string;
}

interface ActiveSectors extends ProfileChartData {
    subSector: string[];
}

interface RegionProfileResponse {
    indicatordata: IndicatorValue[];
    fivewdata: FiveWDataResponse[];
    activeSectors: ActiveSectors[];
    topProgramByBudget: ProfileChartData[];
    topPartnerByBudget: ProfileChartData[];
    topSectorByNoOfPartner: ProfileChartData[];
}

interface DendogramResponse {
    results: {
        name: string;
        children: {
            name: string;
            children: string[];
        }[];
    }[];
}

function RegionProfile(props: Props) {
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
    const [description, setDescription] = useState('');

    const handleDescriptionChange = useCallback(
        (value: string) => {
            setDescription(value);
        },
        [setDescription],
    );
    const regionProfileUrl = selectedRegionData?.id ? `${apiEndPoint}/core/profile?region=${regionLevel}&${regionLevel}_code=${+selectedRegionData.code}` : undefined;
    const [regionProfilePending, regionProfileResponse] = useRequest<RegionProfileResponse>(regionProfileUrl, 'region-profile');
    const dendogramUrl = selectedRegionData?.id ? `${apiEndPoint}/core/regionaldendrogram?region=${regionLevel}&${regionLevel}_code=${selectedRegionData.code}` : undefined;

    const [dendogramUrlPending, dendogramUrlResponse] = useRequest<DendogramResponse>(dendogramUrl, 'region-dendogram');
    const mappedDendogramData = useMemo(() => {
        if (!dendogramUrlResponse) {
            return undefined;
        }
        const { results } = dendogramUrlResponse;
        if (!results) {
            return undefined;
        }
        const mappedRes = results.map((res) => {
            const childCount = res.children.map(c => c.children).flat().length;
            return {
                ...res,
                countChild: childCount,
            };
        });
        return mappedRes.sort((foo, bar) => compareNumber(
            foo.countChild,
            bar.countChild,
            1,
        ));
    }, [dendogramUrlResponse]);

    const indicatorsData = useMemo(
        () => regionProfileResponse?.indicatordata,
        [regionProfileResponse?.indicatordata],
    );

    const fiveWData: FiveWData[] | undefined = useMemo(
        () => {
            const fiveWResponseData = regionProfileResponse?.fivewdata;

            if (!fiveWResponseData) {
                return undefined;
            }
            const fwdData = fiveWResponseData[0];
            return fiveWDataList.map(fwd => ({
                ...fwd,
                value: fwdData[fwd.key],
            }));
        },
        [regionProfileResponse?.fivewdata],
    );

    const activeSectors: ActiveSectors[] | undefined = regionProfileResponse?.activeSectors;

    const activeSectorsForChart: ProfileChartData[] | undefined = activeSectors?.map(sect => ({
        name: sect.name,
        id: sect.id,
        value: sect.value,
        key: sect.key,
    }));

    // eslint-disable-next-line max-len
    const topProgramByBudget: ProfileChartData[] | undefined = regionProfileResponse?.topProgramByBudget;

    // eslint-disable-next-line max-len
    const topPartnerByBudget: ProfileChartData[] | undefined = regionProfileResponse?.topPartnerByBudget;

    // eslint-disable-next-line max-len
    const topSectorByNoOfPartner: ProfileChartData[] | undefined = regionProfileResponse?.topSectorByNoOfPartner;

    const handleAddChartModalClick = useCallback(() => {
        setAddModalVisibility(true);
    }, [setAddModalVisibility]);

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

    const currentDate = new Date().toDateString();

    const dataPending = regionProfilePending || dendogramUrlPending;

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

    const [
        descriptionHidden,
        setDescriptionHidden,
        unsetDescriptionHidden,
    ] = useBasicToggle();

    const [
        dendrogramHidden,
        setDendrogramHidden,
        unsetDendrogramHidden,
    ] = useBasicToggle();

    const [hiddenChartIds, setHiddenChartIds] = useState<string[]>();
    const [hiddenFiveWDataKeys, setHiddenFiveWDataKeys] = useState<string[]>();
    const [hiddenIndicatorsIds, setHiddenIndicatorsIds] = useState<string[]>();
    const [hiddenDendrogramNames, setHiddenDendrogramNames] = useState<string[]>();

    const handleAddHideableFiveWDataKeys = useCallback(
        (key: string | undefined) => {
            if (isFalsyString(key)) {
                return;
            }
            setHiddenFiveWDataKeys((prevKeys) => {
                if (!prevKeys) {
                    return [key];
                }
                return [...prevKeys, key];
            });
        },
        [setHiddenFiveWDataKeys],
    );

    const handleAddHideableIndicatorsIds = useCallback(
        (id: string | undefined) => {
            if (isFalsyString(id)) {
                return;
            }
            setHiddenIndicatorsIds((prevIds) => {
                if (!prevIds) {
                    return [id];
                }
                return [...prevIds, id];
            });
        },
        [setHiddenIndicatorsIds],
    );

    const onResetIndicators = useCallback(
        () => {
            setHiddenFiveWDataKeys(undefined);
            setHiddenIndicatorsIds(undefined);
        },
        [setHiddenFiveWDataKeys, setHiddenIndicatorsIds],
    );

    const handleAddHideableDendrogramNames = useCallback(
        (id: string | undefined) => {
            if (isFalsyString(id)) {
                return;
            }
            setHiddenDendrogramNames((prevIds) => {
                if (!prevIds) {
                    return [id];
                }
                return [...prevIds, id];
            });
        },
        [setHiddenDendrogramNames],
    );

    const onResetDendrogram = useCallback(
        () => {
            setHiddenDendrogramNames(undefined);
        },
        [setHiddenDendrogramNames],
    );

    const handleAddHideableChartIds = useCallback(
        (id: string | undefined) => {
            if (isFalsyString(id)) {
                return;
            }
            setHiddenChartIds((prevIds) => {
                if (!prevIds) {
                    return [id];
                }
                return [...prevIds, id];
            });
        },
        [setHiddenChartIds],
    );

    const resetProfileShown = indicatorsHidden || sectorsHidden
        || descriptionHidden || dendrogramHidden || hiddenChartIds;

    const onResetProfile = useCallback(
        () => {
            unsetIndicatorsHidden();
            unsetSectorsHidden();
            unsetDescriptionHidden();
            setDescription('');
            unsetDendrogramHidden();
            setHiddenChartIds(undefined);
            onResetIndicators();
            onResetDendrogram();
        },
        [
            unsetIndicatorsHidden,
            unsetSectorsHidden,
            unsetDescriptionHidden,
            setDescription,
            unsetDendrogramHidden,
            setHiddenChartIds,
            onResetIndicators,
            onResetDendrogram,
        ],
    );

    const handleRegionChange = useCallback(
        (newRegionId, newSelectedRegionData) => {
            setRegion(newRegionId);
            setSelectedRegionData({
                ...newSelectedRegionData,
                type: regionLevel,
            });
            if (resetProfileShown) {
                onResetProfile();
            }
        },
        [
            setRegion,
            setSelectedRegionData,
            regionLevel,
            resetProfileShown,
            onResetProfile,
        ],
    );

    const handleRegionLevelChange = useCallback(
        (newRegionLevel) => {
            setRegion(undefined);
            setSelectedRegionData(undefined);
            setRegionLevel(newRegionLevel);
            setDescription('');
            if (resetProfileShown) {
                onResetProfile();
            }
        },
        [
            setRegion,
            setSelectedRegionData,
            setRegionLevel,
            setDescription,
            resetProfileShown,
            onResetProfile,
        ],
    );

    const filteredFiveWData = useMemo(
        () => {
            if (!hiddenFiveWDataKeys) {
                return fiveWData;
            }
            return fiveWData?.filter(f => !hiddenFiveWDataKeys.includes(f.key));
        },
        [hiddenFiveWDataKeys, fiveWData],
    );

    const filteredIndicatorsData = useMemo(
        () => {
            if (!hiddenIndicatorsIds) {
                return indicatorsData;
            }
            return indicatorsData?.filter(
                f => !hiddenIndicatorsIds.includes(String(f.indicatorId)),
            );
        },
        [hiddenIndicatorsIds, indicatorsData],
    );

    const filteredDendrogramData = useMemo(
        () => {
            if (!hiddenDendrogramNames) {
                return mappedDendogramData;
            }
            return mappedDendogramData?.filter(
                f => !hiddenDendrogramNames.includes(String(f.name)),
            );
        },
        [hiddenDendrogramNames, mappedDendogramData],
    );

    const resetIndicatorsShown = useMemo(
        () => {
            const totalHiddenFiveWData = !!hiddenFiveWDataKeys?.length;
            const totalHiddenIndicators = !!hiddenIndicatorsIds?.length;
            return totalHiddenFiveWData || totalHiddenIndicators;
        },
        [hiddenFiveWDataKeys, hiddenIndicatorsIds],
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
                        variant="secondary-outline"
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
                                {selectedRegionData?.type === 'district' && (
                                    <div className={styles.parentRegionDetails}>
                                        {selectedRegionData?.provinceName}
                                    </div>
                                )}
                            </div>
                            <RegionProfileMap
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
                                indicatorsData={filteredIndicatorsData}
                                fiveWData={filteredFiveWData}
                                printMode={printMode}
                                onAddHideableFiveWDataKeys={handleAddHideableFiveWDataKeys}
                                onAddHideableIndicatorsIds={handleAddHideableIndicatorsIds}
                                resetIndicatorsShown={resetIndicatorsShown}
                                onResetIndicators={onResetIndicators}
                            />
                        )}
                        {!dataPending && !descriptionHidden && (
                            <div className={styles.description}>
                                <div className={styles.heading}>
                                    <div className={styles.title}>
                                        Description
                                    </div>
                                    <Button
                                        onClick={setDescriptionHidden}
                                        title="Hide Description"
                                        transparent
                                        variant="icon"
                                        className={_cs(
                                            styles.button,
                                            printMode && styles.hidden,
                                        )}
                                    >
                                        <IoMdClose
                                            className={styles.icon}
                                        />
                                    </Button>
                                </div>
                                <TextAreaInput
                                    placeholder="Write your description..."
                                    autoFocus
                                    value={description}
                                    onChange={handleDescriptionChange}
                                    className={styles.textInput}
                                    inputClassName={styles.textAreaInput}
                                    disabled={printMode}
                                />
                            </div>
                        )}
                        {!sectorsHidden && activeSectors && activeSectors.length > 0 && (
                            <Sectors
                                className={styles.sectors}
                                activeSectors={activeSectors}
                                setSectorsHidden={setSectorsHidden}
                                printMode={printMode}
                            />
                        )}
                        {/* eslint-disable-next-line max-len */}
                        {!dataPending && !dendrogramHidden && mappedDendogramData && mappedDendogramData.length > 0 && (
                            <div className={styles.dendogramContainer}>
                                <div className={styles.header}>
                                    <div className={styles.title}>
                                        Dendrogram of Region
                                    </div>
                                    <div className={styles.buttonGroup}>
                                        {hiddenDendrogramNames
                                            && hiddenDendrogramNames.length > 0 && (
                                            <Button
                                                onClick={onResetDendrogram}
                                                title="Reset Dendrogram"
                                                transparent
                                                variant="icon"
                                                className={_cs(
                                                    styles.button,
                                                    printMode && styles.hidden,
                                                )}
                                            >
                                                <IoMdRefresh
                                                    className={styles.icon}
                                                />
                                            </Button>
                                        )}
                                        <Button
                                            onClick={setDendrogramHidden}
                                            title="Hide Dendrogram"
                                            transparent
                                            variant="icon"
                                            className={_cs(
                                                styles.button,
                                                printMode && styles.hidden,
                                            )}
                                        >
                                            <IoMdClose
                                                className={styles.icon}
                                            />
                                        </Button>
                                    </div>
                                </div>
                                {filteredDendrogramData && filteredDendrogramData.map(res => (
                                    <DendogramTree
                                        treeData={res}
                                        key={res.name}
                                        onHideDendrogram={handleAddHideableDendrogramNames}
                                    />
                                ))}
                            </div>
                        )}
                        {!dataPending && regionLevel !== 'municipality' && (
                            <RegionProfileCharts
                                className={styles.charts}
                                printMode={printMode}
                                showAddModal={showAddModal}
                                onAddModalVisibilityChange={setAddModalVisibility}
                                activeSectors={activeSectorsForChart}
                                topProgramByBudget={topProgramByBudget}
                                topPartnerByBudget={topPartnerByBudget}
                                hiddenChartIds={hiddenChartIds}
                                topSectorByNoOfPartner={topSectorByNoOfPartner}
                                handleAddHideableChartIds={handleAddHideableChartIds}
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
export default RegionProfile;
