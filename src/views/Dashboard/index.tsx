import React, { useMemo, useContext, useState, useEffect, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    IoIosArrowForward,
    IoIosArrowBack,
} from 'react-icons/io';
import Tour from 'reactour';

import BubbleLegend, { BubbleLegendType } from '#components/BubbleLegend';
import Button, { useButtonStyling } from '#components/Button';
import RawButton from '#components/RawButton';
import ChoroplethLegend from '#components/ChoroplethLegend';
import DomainContext from '#components/DomainContext';
import IndicatorMap from '#components/IndicatorMap';
import RasterLegend from '#components/RasterLegend';
import VectorLegend from '#components/VectorLegend';
import SingleRegionSelect from '#components/SingleRegionSelect';
import Portal from '#components/Portal';
import DropdownMenu from '#components/DropdownMenu';
import PrintButton from '#components/PrintButton';

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
import useStoredState from '#hooks/useStoredState';
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
import DateRangeSelector from './DateRangeSelector';

import styles from './styles.css';

interface MapRegion {
    centroid?: string;
    id: number;
    name: string;
    code: number;
    lngLat?: mapboxgl.LngLat;
}

type AdminLevel = Province | District | Municipality | undefined;

const tourConfig = [
    {
        selector: '[data-tut=""]',
        content: 'Okay lets get started ! This is overview',
    },
    {
        selector: '[data-tut="left__filter"]',
        content: 'Please feel play around with this dynamic panel. You can filter data by Program, Components, Partners, Sectors, Sub-sectors, Markers, and Sub-markers.',
    },
    {
        selector: '[data-tut="view__by"]',
        content: 'Also, you can filter data by region - Province, District and Municipality.',
    },
    {
        selector: '[data-tut="map__options"]',
        content: 'Select different map options to filter in more detail. You can filter by data types, indicators, layers. All the filtered effects can be observed in the map',
        position: 'left',
    },
    {
        selector: '[data-tut="date__slider"]',
        content: 'Slide this date to get programs that belong to the date range set here. You can observe the programs being changed in the left filter panel.',
    },
    {
        selector: '[data-tut="top__summary"]',
        content: 'Summary is shown here',
    },
    {
        selector: '[data-tut="indicator__graph"]',
        content: 'Indicators legend is shown here',
    },
    {
        selector: '[data-tut="nepal__map"]',
        content: 'You can view map representation of data here based on filters and map options selected. Please hover or click on map to observe its features.',
        position: 'left',
    },
];

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

const defaultStartDate = '2015-01-01';
const defaultEndDate = '2021-12-31';

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

    // print
    const [
        printMode,
        setPrintMode,
    ] = useState(false);

    const [
        region,
        setRegion,
    ] = useState<MapRegion>();

    const [
        hoveredRegion,
        setHoveredRegion,
    ] = useState<MapRegion>();
    // Show/hide filters
    const [sideContentMinimized, , , toggleSideContainerMinimized] = useBasicToggle();
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
                // FIXME: should get data from backend in proper format
                bubbleMapState: fiveWMapState.map(({ id, value }) => ({ id, value: +value })),
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
            // FIXME: should get data from backend in proper format
            bubbleMapState: indicatorMapState.map(({ id, value }) => ({ id, value: +value })),
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
            const regionProperties = feature.properties as MapRegion;
            setRegion({
                ...regionProperties,
                code: regionProperties.id,
                lngLat,
            });

            return true;
        },
        [setRegion],
    );

    const handleMapRegionHover = useCallback(
        (
            feature: mapboxgl.MapboxGeoJSONFeature,
            lngLat: mapboxgl.LngLat,
        ) => {
            const regionProperties = feature.properties as MapRegion;
            setHoveredRegion({
                ...regionProperties,
                code: regionProperties.id,
                lngLat,
            });
            return true;
        },
        [setHoveredRegion],
    );

    const handleMapRegionLeave = useCallback(
        () => setHoveredRegion(undefined),
        [setHoveredRegion],
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

            const reg: MapRegion = {
                id: +adminLevel.code,
                name: adminLevel.name,
                code: +adminLevel.code,
            };

            setRegion(reg);
        },
        [setRegion],
    );

    const handleRegionLevelChange = useCallback(
        (regionLvl: RegionLevelOption) => {
            setRegionLevel(regionLvl);
            setRegion(undefined);
            setHoveredRegion(undefined);
        },
        [setRegion, setRegionLevel, setHoveredRegion],
    );

    const dataExplored = hash === 'regions' || hash === 'programs';

    React.useEffect(() => {
        if (dataExplored) {
            setPrintMode(false);
        }
    }, [dataExplored, setPrintMode]);

    useEffect(() => {
        const controls = document
            .getElementsByClassName('mapboxgl-control-container')[0] as HTMLDivElement;

        if (controls) {
            if (printMode) {
                controls.style.visibility = 'hidden';
            } else {
                controls.style.visibility = 'visible';
            }
        }

        return () => {
            if (controls) {
                controls.style.visibility = 'visible';
            }
        };
    }, [printMode]);

    const [
        tooltipExpanded,
        setTooltipExpanded,
        unsetExpandableTooltip,
    ] = useBasicToggle();

    const regionDetailShown = useMemo(() => !!region, [region]);

    const [toured, setToured] = useStoredState<string>(
        'dashboard-toured',
        'false',
    );

    const handleTourComplete = useCallback(
        () => {
            setToured('true');
        },
        [setToured],
    );

    const handleResetTour = useCallback(
        () => {
            setToured('false');
        },
        [setToured],
    );
    const demoHidden = useMemo(() => toured === 'true', [toured]);

    const [startDate, setStartDate] = useState<string>(defaultStartDate);
    const [endDate, setEndDate] = useState<string>(defaultEndDate);

    const pending = mapLayerListPending || indicatorListPending
        || indicatorMapStatePending || fiveWMapStatePending;

    return (
        <div
            className={_cs(
                styles.dashboard,
                className,
                printMode && styles.printMode,
            )}
        >
            {!demoHidden && !pending && (
                <Tour
                    steps={tourConfig}
                    isOpen
                    onRequestClose={handleTourComplete}
                />
            )}
            <aside
                className={_cs(
                    styles.sideContent,
                    sideContentMinimized && styles.minimized,
                )}
                data-tut="left__filter"
            >
                {!printMode && (
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
                )}
                <FiltersPanel
                    isMinimized={sideContentMinimized}
                    startDate={startDate}
                    endDate={endDate}
                    dataExplored={dataExplored}
                />
            </aside>
            <main className={styles.mainContent}>
                <div className={styles.content}>
                    {dataExplored ? (
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

                                    handleRegionLevelChange={handleRegionLevelChange}
                                />
                            )}
                            {hash === 'programs' && (
                                <ProgramDetails
                                    className={_cs(
                                        styles.regionDetails,
                                        sideContentMinimized && styles.filterMinimized,
                                    )}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <header
                                className={styles.header}
                                data-tut="view__by"
                            >
                                <SingleRegionSelect
                                    onRegionLevelChange={handleRegionLevelChange}
                                    regionLevel={regionLevel}
                                    region={region?.id}
                                    onRegionChange={handleRegionChange}
                                    disabled={printMode}
                                    showDropDownIcon
                                    selectInputClassName={styles.demoModeRegionSelect}
                                    segmentLabel="View by"
                                    segmentInputClassName={styles.segmentInput}
                                    segmentLabelClassName={styles.label}
                                />
                                {demoHidden && (
                                    <Button
                                        onClick={handleResetTour}
                                        variant="secondary-outline"
                                        className={styles.demoButton}
                                    >
                                        View Demo
                                    </Button>
                                )}
                            </header>
                            <div
                                className={styles.mapAndLegends}
                            >
                                <React.Fragment
                                    data-tut="nepal__map"
                                >
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
                                        onHover={handleMapRegionHover}
                                        onLeave={handleMapRegionLeave}
                                        hoveredRegion={hoveredRegion}
                                        choroplethTitle={choroplethTitle}
                                        bubbleTitle={bubbleTitle}
                                    />
                                </React.Fragment>
                                <DropdownMenu
                                    label="Map Options"
                                    dropdownContainerClassName={_cs(
                                        styles.mapOptionsDropdown,
                                        !demoHidden && styles.demoMode,
                                    )}
                                    {...mapOptionsButtonProps}
                                    dataTut="map__options"
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
                                <div
                                    className={styles.summaryContainer}
                                    data-tut="top__summary"
                                >
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
                                        !sideContentMinimized && regionDetailShown
                                        && styles.overflow,
                                    )}
                                    data-tut="indicator__graph"
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
                                <div
                                    className={_cs(
                                        styles.timeSliderContainer,
                                        regionDetailShown && styles.shiftLeft,
                                    )}
                                    data-tut="date__slider"
                                >
                                    <DateRangeSelector
                                        className={_cs(
                                            styles.timeSlideContainer,
                                            regionDetailShown && styles.shiftLeft,
                                        )}
                                        startDate={startDate}
                                        setStartDate={setStartDate}
                                        endDate={endDate}
                                        setEndDate={setEndDate}
                                        defaultStartDate={defaultStartDate}
                                        defaultEndDate={defaultEndDate}
                                    />
                                </div>
                            </div>
                            {region && tooltipExpanded && (
                                <Modal
                                    onClose={unsetExpandableTooltip}
                                    className={styles.tooltipModal}
                                    headerClassName={styles.tooltipModalHeader}
                                    bodyClassName={styles.tooltipModalBody}
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
