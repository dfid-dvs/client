import React, { useMemo, useContext, useState, useEffect, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    IoIosArrowForward,
    IoIosArrowBack,
} from 'react-icons/io';

import BubbleLegend, { BubbleLegendType } from '#components/BubbleLegend';
import { useButtonStyling } from '#components/Button';
import RawButton from '#components/RawButton';
import ChoroplethLegend from '#components/ChoroplethLegend';
import DomainContext from '#components/DomainContext';
import IndicatorMap from '#components/IndicatorMap';
import RasterLegend from '#components/RasterLegend';
import VectorLegend from '#components/VectorLegend';
import SingleRegionSelect from '#components/SingleRegionSelect';
import Label from '#components/Label';
import Portal from '#components/Portal';
import DropdownMenu from '#components/DropdownMenu';

import useRequest from '#hooks/useRequest';
import useHash from '#hooks/useHash';

import ProgramDetails from './ProgramDetails';
import RegionDetails from './RegionDetails';

import {
    generateChoroplethMapPaintAndLegend,
    generateBubbleMapPaintAndLegend,
    filterMapState,
} from '#utils/common';
import {
    MultiResponse,
    LegendItem,
    Layer,
    Indicator,
    isRasterLayer,
    isVectorLayer,
    Province,
    District,
    Municipality,
    RegionLevelOption,
} from '#types';

import {
    colorDomain,
    apiEndPoint,
} from '#utils/constants';
import useBasicToggle from '#hooks/useBasicToggle';
import Modal from '#components/Modal';

import Tooltip from './Tooltip';

import useMapStateForFiveW from './useMapStateForFiveW';
import useMapStateForIndicator from './useMapStateForIndicator';
import FiltersPanel from './FiltersPanel';
import Summary from './Summary';

import {
    FiveWOption,
    isFiveWOptionKey,
} from './types';

import MapOptions from './MapOptions';
import splitCombinedSelectors from './splitCombinedSelectors';

import styles from './styles.css';

interface Region {
    id: number;
    name: string;
    code: number;
}

interface ClickedRegion {
    feature: GeoJSON.Feature<GeoJSON.Polygon, Region>;
    lngLat: mapboxgl.LngLatLike;
}

type AdminLevel = Province | District | Municipality | undefined;

const fiveWOptions: FiveWOption[] = [
    {
        key: 'allocatedBudget',
        label: 'Allocated Budget',
        unit: '£',
    },
    {
        key: 'programCount',
        label: 'Programs',
        datatype: 'integer',
        unit: 'Count',
    },
    {
        key: 'partnerCount',
        label: 'Partners',
        datatype: 'integer',
        unit: 'Count',
    },
    {
        key: 'componentCount',
        label: 'Components',
        datatype: 'integer',
        unit: 'Count',
    },
    {
        key: 'sectorCount',
        label: 'Sectors',
        datatype: 'integer',
        unit: 'Count',
    },
];

const fiveWKeySelector = (option: FiveWOption) => option.key;
const fiveWLabelSelector = (option: FiveWOption) => option.label;

const legendKeySelector = (option: LegendItem) => option.radius;
const legendValueSelector = (option: LegendItem) => option.value;
const legendRadiusSelector = (option: LegendItem) => option.radius;

interface Props {
    className?: string;
}

const Dashboard = (props: Props) => {
    const { className } = props;
    const {
        regionLevel,
        setRegionLevel,
        markers,
        programs,
        partners,
        sectors,
    } = useContext(DomainContext);

    const mapOptionsButtonProps = useButtonStyling({
        className: styles.mapOptionsButton,
        variant: 'outline',
    });

    // Filter
    const [
        selectedIndicator,
        setSelectedIndicator,
    ] = useState<number | undefined>(undefined);
    const [
        selectedFiveWOption,
        setFiveWOption,
    ] = useState<string | undefined>('allocatedBudget');
    const [
        mapStyleInverted,
        setMapStyleInverted,
    ] = useState(false);
    const [
        selectedRasterLayer,
        setSelectedRasterLayer,
    ] = useState<number | undefined>(undefined);
    const [
        selectedVectorLayers,
        setSelectedVectorLayers,
    ] = useState<number[] | undefined>([]);

    // tooltip
    const [
        clickedRegionProperties,
        setClickedRegionProperties,
    ] = useState<ClickedRegion | undefined>();

    // print
    const [
        printMode,
        setPrintMode,
    ] = useState(false);

    const [
        region,
        setRegion,
    ] = useState<Region>();
    // Show/hide filters
    const [sideContentMinimized, , , toggleSideContainerMinimized] = useBasicToggle();
    const [regionFilterShown, , , toggleRegionFilter] = useBasicToggle();
    const [mapFilterShown, , , toggleMapFilter] = useBasicToggle();
    const [filterButtonHidden, hideFilterButton, showFilterButton] = useBasicToggle();

    const mapLayerGetUrl = `${apiEndPoint}/core/map-layer/`;
    const [
        mapLayerListPending,
        mapLayerListResponse,
    ] = useRequest<MultiResponse<Layer>>(mapLayerGetUrl, 'map-layer-list');

    const rasterLayers = useMemo(
        () => (mapLayerListResponse?.results.filter(isRasterLayer)),
        [mapLayerListResponse],
    );

    const selectedRasterLayerDetail = useMemo(
        () => rasterLayers?.find(v => v.id === selectedRasterLayer),
        [rasterLayers, selectedRasterLayer],
    );

    const vectorLayers = useMemo(
        () => (mapLayerListResponse?.results.filter(isVectorLayer)),
        [mapLayerListResponse],
    );

    const selectedVectorLayersDetail = useMemo(
        () => (
            selectedVectorLayers
                ? vectorLayers?.filter(v => selectedVectorLayers.includes(v.id))
                : undefined
        ),
        [vectorLayers, selectedVectorLayers],
    );

    const indicatorListGetUrl = `${apiEndPoint}/core/indicator-list/?is_dashboard=true`;
    const [
        indicatorListPending,
        indicatorListResponse,
    ] = useRequest<MultiResponse<Indicator>>(indicatorListGetUrl, 'indicator-list');

    const indicatorList = useMemo(() => {
        const regLevel = regionLevel === 'municipality' ? 'palika' : regionLevel;
        return indicatorListResponse?.results.filter(
            indicator => indicator.federalLevel === 'all' || indicator.federalLevel === regLevel,
        );
    }, [indicatorListResponse?.results, regionLevel]);

    const {
        selectedIndicator: validSelectedIndicator,
        selectedIndicatorDetails,
    } = useMemo(
        () => {
            const indicatorDetail = isDefined(selectedIndicator)
                ? indicatorList?.find(indicator => indicator.id === selectedIndicator)
                : undefined;
            return {
                selectedIndicator: indicatorDetail ? selectedIndicator : undefined,
                selectedIndicatorDetails: indicatorDetail,
            };
        },
        [indicatorList, selectedIndicator],
    );

    const [
        indicatorMapStatePending,
        indicatorMapState,
    ] = useMapStateForIndicator(regionLevel, validSelectedIndicator);

    const fiveWOptionKey = useMemo(
        () => {
            if (!selectedFiveWOption) {
                return undefined;
            }

            return isFiveWOptionKey(selectedFiveWOption)
                ? selectedFiveWOption
                : 'programCount' as const;
        },
        [selectedFiveWOption],
    );

    const [markerIdList, submarkerIdList] = splitCombinedSelectors(markers, 'submarker');
    // FIXME: Update programs to String[]
    const [programIdList, componentIdList] = splitCombinedSelectors(programs, 'subprogram');
    const [partnerIdList] = splitCombinedSelectors(partners, 'subpartner');
    const [sectorIdList, subsectorIdList] = splitCombinedSelectors(sectors, 'subsector');

    const [
        fiveWMapStatePending,
        fiveWMapState,
    ] = useMapStateForFiveW(
        regionLevel,
        markerIdList,
        submarkerIdList,
        programIdList,
        componentIdList,
        partnerIdList,
        sectorIdList,
        subsectorIdList,
        fiveWOptionKey,
        false,
    );

    const {
        choroplethSelected,
        choroplethMapState,
        choroplethPending,
        choroplethTitle,
        choroplethInteger,
        choroplethUnit,

        bubbleSelected,
        bubbleMapState,
        bubblePending,
        bubbleTitle,
        bubbleInteger,
        bubbleUnit,

        titleForPrintBar,
    } = useMemo(() => {
        const fiveW = fiveWOptions.find(i => fiveWKeySelector(i) === selectedFiveWOption);
        const fiveWTitle = fiveW && fiveWLabelSelector(fiveW);

        const title = [fiveWTitle, selectedIndicatorDetails?.fullTitle].filter(isDefined).join(' & ');

        if (mapStyleInverted) {
            return {
                choroplethMapState: indicatorMapState,
                choroplethPending: indicatorMapStatePending,
                choroplethTitle: selectedIndicatorDetails?.fullTitle,
                choroplethInteger: selectedIndicatorDetails?.datatype === 'integer',
                choroplethUnit: selectedIndicatorDetails?.unit,
                choroplethSelected: isDefined(selectedIndicator),

                bubbleMapState: fiveWMapState,
                bubblePending: fiveWMapStatePending,
                bubbleTitle: fiveWTitle,
                bubbleInteger: fiveW?.datatype === 'integer',
                bubbleUnit: fiveW?.unit,
                bubbleSelected: isDefined(selectedFiveWOption),

                titleForPrintBar: title,
            };
        }
        return {
            choroplethSelected: isDefined(selectedFiveWOption),
            choroplethMapState: fiveWMapState,
            choroplethPending: fiveWMapStatePending,
            choroplethTitle: fiveWTitle,
            choroplethInteger: fiveW?.datatype === 'integer',
            choroplethUnit: fiveW?.unit,

            bubbleSelected: isDefined(selectedIndicator),
            bubbleMapState: indicatorMapState,
            bubblePending: indicatorMapStatePending,
            bubbleTitle: selectedIndicatorDetails?.fullTitle,
            bubbleInteger: selectedIndicatorDetails?.datatype === 'integer',
            bubbleUnit: selectedIndicatorDetails?.unit,

            titleForPrintBar: title,
        };
    }, [
        mapStyleInverted,
        indicatorMapState,
        fiveWMapState,
        indicatorMapStatePending,
        fiveWMapStatePending,
        selectedFiveWOption,
        selectedIndicator,
        selectedIndicatorDetails,
    ]);

    const {
        paint: mapPaint,
        legend: mapLegend,
        min: dataMinValue,
        minExceeds: dataMinExceeds,
        maxExceeds: dataMaxExceeds,
    } = useMemo(
        () => {
            const { min, max, minExceeds, maxExceeds } = filterMapState(
                choroplethMapState,
                regionLevel,
                true,
            );
            return {
                ...generateChoroplethMapPaintAndLegend(colorDomain, min, max, choroplethInteger),
                minExceeds,
                maxExceeds,
            };
        },
        [choroplethMapState, choroplethInteger, regionLevel],
    );

    const {
        mapPaint: bubblePaint,
        legend: bubbleLegend,
        legendType: bubbleLegendType,
    } = useMemo(
        () => {
            const valueList = bubbleMapState
                .map(d => d.value)
                .filter(isDefined)
                .map(Math.abs);

            const hasNegativeValues = bubbleMapState.some(v => v.value < 0);
            const hasPositiveValues = bubbleMapState.some(v => v.value > 0);

            let legendType: BubbleLegendType = 'both';
            if (hasNegativeValues && !hasPositiveValues) {
                legendType = 'negative';
            } else if (!hasNegativeValues && hasPositiveValues) {
                legendType = 'positive';
            }

            const min = Math.min(...valueList);
            const max = Math.max(...valueList);

            let maxRadius = 50;
            if (regionLevel === 'district') {
                maxRadius = 40;
            } else if (regionLevel === 'municipality') {
                maxRadius = 30;
            }

            return {
                legendType,
                ...generateBubbleMapPaintAndLegend(min, max, maxRadius, bubbleInteger),
            };
        },
        [bubbleMapState, bubbleInteger, regionLevel],
    );

    const hash = useHash();

    const handleFiveWOptionChange = useCallback(
        (fiveWOption: string | undefined) => {
            setFiveWOption(fiveWOption);
        },
        [],
    );

    const handleMapRegionClick = useCallback(
        (
            feature: mapboxgl.MapboxGeoJSONFeature,
            lngLat: mapboxgl.LngLat,
        ) => {
            setClickedRegionProperties({
                feature: feature as unknown as GeoJSON.Feature<GeoJSON.Polygon, Region>,
                lngLat,
            });
            const regionProperties = feature.properties as Region;
            setRegion(regionProperties);

            return true;
        },
        [setClickedRegionProperties, setRegion],
    );

    const handleTooltipClose = useCallback(
        () => {
            setClickedRegionProperties(undefined);
        },
        [setClickedRegionProperties],
    );

    const handleRegionChange = useCallback(
        (newRegionId: number | undefined, adminLevel: AdminLevel) => {
            if (!newRegionId) {
                setRegion(undefined);
                return;
            }

            if (!adminLevel) {
                return;
            }

            const reg: Region = {
                id: Number(adminLevel.code),
                name: adminLevel.name,
                code: adminLevel.id,
            };

            setRegion(reg);
        },
        [setRegion],
    );

    const handleRegionLevelChange = useCallback(
        (regionLvl: RegionLevelOption) => {
            setRegionLevel(regionLvl);
            setRegion(undefined);
        },
        [setRegion, setRegionLevel],
    );

    useEffect(() => {
        handleTooltipClose();
    }, [hash, handleTooltipClose]);

    // NOTE: clear tooltip on region change
    useEffect(
        () => {
            setClickedRegionProperties(undefined);
        },
        [regionLevel],
    );

    const dataExplored = hash === 'regions' || hash === 'program';

    const [
        tooltipExpanded,
        setTooltipExpanded,
        unsetExpandableTooltip,
    ] = useBasicToggle();
    return (
        <div
            className={_cs(
                styles.dashboard,
                className,
                printMode && styles.printMode,
            )}
        >
            <aside
                className={_cs(
                    styles.sideContent,
                    sideContentMinimized && styles.minimized,
                )}
            >
                <Portal>
                    <RawButton
                        className={_cs(
                            styles.toggleVisibilityButton,
                            sideContentMinimized && styles.sideContentMinimized,
                        )}
                        onClick={toggleSideContainerMinimized}
                    >
                        {sideContentMinimized ? <IoIosArrowForward /> : <IoIosArrowBack />}
                    </RawButton>
                </Portal>
                <FiltersPanel isMinimized={sideContentMinimized} />
            </aside>
            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <Label>
                        View by
                    </Label>
                    <SingleRegionSelect
                        onRegionLevelChange={handleRegionLevelChange}
                        regionLevel={regionLevel}
                        region={region?.id}
                        onRegionChange={handleRegionChange}
                        disabled={printMode}
                    />
                </header>
                <div className={styles.content}>
                    { dataExplored ? (
                        <>
                            {hash === 'regions' && (
                                <RegionDetails
                                    indicatorListPending={indicatorListPending}
                                    indicatorList={indicatorList}
                                    className={_cs(
                                        styles.regionDetails,
                                        sideContentMinimized && styles.filterMinimized,
                                    )}
                                    regionLevel={regionLevel}
                                    onHideFilterButton={hideFilterButton}
                                    onShowFilterButton={showFilterButton}
                                    filterButtonHidden={filterButtonHidden}

                                    markerIdList={markerIdList}
                                    submarkerIdList={submarkerIdList}
                                    programIdList={programIdList}
                                    componentIdList={componentIdList}
                                    partnerIdList={partnerIdList}
                                    sectorIdList={sectorIdList}
                                    subsectorIdList={subsectorIdList}
                                />
                            )}
                            {hash === 'programs' && (
                                <ProgramDetails />
                            )}
                        </>
                    ) : (
                        <>
                            <IndicatorMap
                                className={styles.mapContainer}
                                regionLevel={regionLevel}
                                choroplethMapState={choroplethMapState}
                                choroplethMapPaint={mapPaint}
                                bubbleMapState={bubbleMapState}
                                bubbleMapPaint={bubblePaint}
                                rasterLayer={selectedRasterLayerDetail}
                                vectorLayers={selectedVectorLayersDetail}
                                onClick={handleMapRegionClick}
                                printMode={printMode}
                                selectedRegionId={region?.code}
                            />
                            <DropdownMenu
                                label="Map Options"
                                dropdownContainerClassName={styles.mapOptionsDropdown}
                                {...mapOptionsButtonProps}
                            >
                                <MapOptions
                                    fiveWOptions={fiveWOptions}
                                    selectedFiveWOption={selectedFiveWOption}
                                    handleFiveWOptionChange={handleFiveWOptionChange}
                                    indicatorListPending={indicatorListPending}
                                    indicatorList={indicatorList}
                                    setSelectedIndicator={setSelectedIndicator}
                                    validSelectedIndicator={validSelectedIndicator}
                                    selectedIndicatorDetails={selectedIndicatorDetails}
                                    mapStyleInverted={mapStyleInverted}
                                    setMapStyleInverted={setMapStyleInverted}
                                    mapLayerListPending={mapLayerListPending}
                                    vectorLayers={vectorLayers}
                                    setSelectedVectorLayers={setSelectedVectorLayers}
                                    selectedVectorLayers={selectedVectorLayers}
                                    rasterLayers={rasterLayers}
                                    setSelectedRasterLayer={setSelectedRasterLayer}
                                    selectedRasterLayer={selectedRasterLayer}
                                />
                            </DropdownMenu>
                            <div className={styles.summaryContainer}>
                                <Summary
                                    markerIdList={markerIdList}
                                    submarkerIdList={submarkerIdList}
                                    programIdList={programIdList}
                                    componentIdList={componentIdList}
                                    partnerIdList={partnerIdList}
                                    sectorIdList={sectorIdList}
                                    subsectorIdList={subsectorIdList}
                                />
                                {region && (
                                    <Tooltip
                                        region={region}
                                        className={styles.clickedRegionDetail}
                                        regionLevel={regionLevel}

                                        markerIdList={markerIdList}
                                        submarkerIdList={submarkerIdList}
                                        programIdList={programIdList}
                                        componentIdList={componentIdList}
                                        partnerIdList={partnerIdList}
                                        sectorIdList={sectorIdList}
                                        subsectorIdList={subsectorIdList}

                                        tooltipExpanded={tooltipExpanded}
                                        setTooltipExpanded={setTooltipExpanded}
                                    />
                                )}
                            </div>
                            <div
                                className={_cs(
                                    styles.legendContainer,
                                    sideContentMinimized && styles.filterMinimized,
                                )}
                            >
                                {choroplethSelected && (
                                    <ChoroplethLegend
                                        className={styles.legend}
                                        title={choroplethTitle}
                                        minValue={dataMinValue}
                                        legend={mapLegend}
                                        unit={choroplethUnit}
                                        minExceeds={dataMinExceeds}
                                        maxExceeds={dataMaxExceeds}
                                        pending={choroplethPending}
                                    />
                                )}
                                {bubbleSelected && (
                                    <BubbleLegend
                                        className={styles.legend}
                                        title={bubbleTitle}
                                        data={bubbleLegend}
                                        keySelector={legendKeySelector}
                                        valueSelector={legendValueSelector}
                                        radiusSelector={legendRadiusSelector}
                                        legendType={bubbleLegendType}
                                        unit={bubbleUnit}
                                        pending={bubblePending}
                                    />
                                )}
                                {selectedRasterLayerDetail && (
                                    <RasterLegend
                                        className={styles.legend}
                                        rasterLayer={selectedRasterLayerDetail}
                                    />
                                )}
                                {selectedVectorLayersDetail
                                    && selectedVectorLayersDetail.length > 0 && (
                                    <VectorLegend
                                        className={styles.legend}
                                        vectorLayers={selectedVectorLayersDetail}
                                    />
                                )}
                            </div>
                            {region && tooltipExpanded && (
                                <Modal
                                    onClose={unsetExpandableTooltip}
                                    className={styles.tooltipModal}
                                    headerClassName={styles.tooltipModalHeader}
                                    bodyClassName={styles.tooltipModalBody}
                                    header="hello"
                                >
                                    <Tooltip
                                        region={region}
                                        className={styles.clickedRegionDetail}
                                        regionLevel={regionLevel}

                                        markerIdList={markerIdList}
                                        submarkerIdList={submarkerIdList}
                                        programIdList={programIdList}
                                        componentIdList={componentIdList}
                                        partnerIdList={partnerIdList}
                                        sectorIdList={sectorIdList}
                                        subsectorIdList={subsectorIdList}
                                        unsetTooltipExpanded={unsetExpandableTooltip}
                                        tooltipExpanded={tooltipExpanded}
                                    />
                                </Modal>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
