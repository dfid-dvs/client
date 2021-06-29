import React, { useMemo, useContext, useState, useEffect, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    IoIosArrowForward,
    IoIosArrowBack,
} from 'react-icons/io';
import Tour, { ReactourStep } from 'reactour';

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
import SegmentInput from '#components/SegmentInput';

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

type StatusTabOptionKeys = 'all' | 'ongoing' | 'completed';

interface StatusTabOption {
    key: StatusTabOptionKeys;
    label: string;
}

const statusTabOptions: StatusTabOption[] = [
    { key: 'all', label: 'All' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'completed', label: 'Completed' },
];

const statusKeySelector = (item: StatusTabOption) => item.key;
const statusLabelSelector = (item: StatusTabOption) => item.label;

const walkthroughContent: ReactourStep[] = [
    {
        content: 'Welcome to British Embassy Kathmandu’s Data Visualisation System. Let\'s get started.',
    },
    {
        selector: '[data-tut="left__filter"]',
        content: 'Use this panel to filter data by Program, Components, Partners, Sectors and Markers. Only the filtered information is displayed in the map and the summary panel on right.',
    },
    {
        selector: '[data-tut="view__by"]',
        content: 'Use this panel to toggle between province, district and municipality view and select the region of your interest.',
    },
    {
        selector: '[data-tut="status"]',
        content: 'Use this section to filter activities by status.',
    },
    {
        selector: '[data-tut="map__options"]',
        content: 'Use this space to select different indicators to view in the map. BEK specific indicators include Budget allocated, programs, components, partners and sectors. There are also more than 30 external contextual indicators relevant to Nepal to select and visualise on the map.',
        position: 'left',
    },
    {
        selector: '[data-tut="date__slider"]',
        content: 'Drag this slider at both ends to select a specific time period. You can also manually inputthe start and end date.',
    },
    {
        selector: '[data-tut="top__summary"]',
        content: 'This panel shows the overall summary based on the filters applied in the left panel.',
    },
    {
        selector: '[data-tut="indicator__graph"]',
        content: 'This is the legend bar corresponding to the indicator(s) selected on the map option panel.',
    },
    {
        content: 'You can view map representation of data here based on filters and map options selected. Please hover or click on the map for more information.',
    },
];

const fiveWOptions: FiveWOption[] = [
    {
        key: 'allocatedBudget',
        label: 'Budget Spend',
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

const defaultStartDate = '2012-01-01';
const defaultEndDate = '2026-12-31';

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
    const [toolTipMinimized, , , toggleToolTipMinimized] = useBasicToggle();
    const [filterButtonHidden, hideFilterButton, showFilterButton] = useBasicToggle();
    const [selectedStatus, setSelectedStatus] = useState<StatusTabOptionKeys>('all');

    const selectedFilterStatus = selectedStatus === 'all' ? undefined : selectedStatus;

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
    const [programIdList, componentIdList] = splitCombinedSelectors(programs, 'subprogram');
    const [partnerIdList] = splitCombinedSelectors(partners, 'subpartner');
    const [sectorIdList, subsectorIdList] = splitCombinedSelectors(sectors, 'subsector');

    const [
        fiveWMapStatePending,
        fiveWMapState,
        fiveWMapDataForHover,
    ] = useMapStateForFiveW(
        regionLevel,
        markerIdList,
        submarkerIdList,
        programIdList,
        componentIdList,
        partnerIdList,
        sectorIdList,
        subsectorIdList,
        selectedFilterStatus,
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
    } = useMemo(() => {
        const fiveW = fiveWOptions.find(i => fiveWKeySelector(i) === selectedFiveWOption);
        const fiveWTitle = fiveW && fiveWLabelSelector(fiveW);

        if (mapStyleInverted) {
            return {
                choroplethMapState: indicatorMapState,
                choroplethPending: indicatorMapStatePending,
                choroplethTitle: selectedIndicatorDetails?.fullTitle,
                choroplethInteger: selectedIndicatorDetails?.dataType === 'integer',
                choroplethUnit: selectedIndicatorDetails?.unit,
                choroplethSelected: isDefined(selectedIndicator),
                // FIXME: should get data from backend in proper format
                bubbleMapState: fiveWMapState.map(({ id, value }) => ({ id, value: +value })),
                bubblePending: fiveWMapStatePending,
                bubbleTitle: fiveWTitle,
                bubbleInteger: fiveW?.datatype === 'integer',
                bubbleUnit: fiveW?.unit,
                bubbleSelected: isDefined(selectedFiveWOption),
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
            bubbleInteger: selectedIndicatorDetails?.dataType === 'integer',
            bubbleUnit: selectedIndicatorDetails?.unit,
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
        [],
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
        [],
    );

    const handleMapRegionLeave = useCallback(
        () => setHoveredRegion(undefined),
        [],
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
        [],
    );

    const handleRegionLevelChange = useCallback(
        (regionLvl: RegionLevelOption) => {
            setRegionLevel(regionLvl);
            setRegion(undefined);
            setHoveredRegion(undefined);
        },
        [setRegionLevel],
    );

    const dataExplored = hash === 'regions' || hash === 'programmes';

    React.useEffect(() => {
        if (dataExplored) {
            setPrintMode(false);
        }
    }, [dataExplored]);

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
                    steps={walkthroughContent}
                    isOpen
                    onRequestClose={handleTourComplete}
                    closeWithMask={false}
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
                            {hash === 'programmes' && (
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
                            >
                                <div className={styles.filters}>
                                    <div data-tut="view__by">
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
                                    </div>
                                    <div data-tut="status">
                                        <SegmentInput
                                            options={statusTabOptions}
                                            optionKeySelector={statusKeySelector}
                                            optionLabelSelector={statusLabelSelector}
                                            value={selectedStatus}
                                            onChange={setSelectedStatus}
                                            className={styles.statusFilter}
                                            label="Status"
                                            labelClassName={styles.label}
                                        />
                                    </div>
                                </div>
                                {demoHidden && (
                                    <Button
                                        onClick={handleResetTour}
                                        variant="secondary-outline"
                                        className={styles.demoButton}
                                    >
                                        User Guide
                                    </Button>
                                )}
                            </header>
                            <div
                                className={styles.mapAndLegends}
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
                                    bubbleTitle={bubbleTitle}
                                    choroplethTitle={choroplethTitle}
                                    fiveWMapDataForHover={fiveWMapDataForHover}
                                    isMinimized={sideContentMinimized}
                                    indicatorMapState={indicatorMapState}
                                />
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
                                        selectedStatus={selectedFilterStatus}
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
                                            toolTipMinimized={toolTipMinimized}
                                            toggleTooltipMinimized={toggleToolTipMinimized}
                                            selectedStatus={selectedFilterStatus}
                                        />
                                    )}
                                </div>
                                <div
                                    className={_cs(
                                        styles.legendContainer,
                                        sideContentMinimized && styles.filterMinimized,
                                        !sideContentMinimized && regionDetailShown
                                        && styles.overflow,
                                        toolTipMinimized && styles.tooltipMinimized,
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
                                        toolTipMinimized && styles.tooltipMinimized,
                                    )}
                                    data-tut="date__slider"
                                >
                                    <DateRangeSelector
                                        className={_cs(
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
                                        selectedStatus={selectedFilterStatus}
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
