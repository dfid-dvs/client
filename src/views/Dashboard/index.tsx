import React, { useMemo, useContext, useState, useEffect, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    IoIosArrowForward,
    IoIosArrowBack,
} from 'react-icons/io';
import { MdFilterList } from 'react-icons/md';

import MapTooltip from '#remap/MapTooltip';

import BubbleLegend, { BubbleLegendType } from '#components/BubbleLegend';
import Button from '#components/Button';
import ChoroplethLegend from '#components/ChoroplethLegend';
import DomainContext from '#components/DomainContext';
import IndicatorMap from '#components/IndicatorMap';
import PrintButton from '#components/PrintButton';
import PrintDetailsBar from '#components/PrintDetailsBar';
import RasterLegend from '#components/RasterLegend';
import VectorLegend from '#components/VectorLegend';
import RegionSelector from '#components/RegionSelector';
import SelectInput from '#components/SelectInput';
import MultiSelectInput from '#components/MultiSelectInput';
import ToggleButton from '#components/ToggleButton';

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
} from '#types';

import {
    colorDomain,
    apiEndPoint,
} from '#utils/constants';
import useBasicToggle from '#hooks/useBasicToggle';

import Tooltip from './Tooltip';
import Sidepanel from './Sidepanel';

import useMapStateForFiveW from './useMapStateForFiveW';
import useMapStateForIndicator from './useMapStateForIndicator';
import FiltersPanel from './FiltersPanel';
import Summary from './Summary';

import {
    FiveWOption,
    isFiveWOptionKey,
} from './types';

import styles from './styles.css';
import ExploreData from './ExploreData';

interface Region {
    name: string;
}

interface ClickedRegion {
    feature: GeoJSON.Feature<GeoJSON.Polygon, Region>;
    lngLat: mapboxgl.LngLatLike;
}

const onClickTooltipOptions: mapboxgl.PopupOptions = {
    closeOnClick: true,
    closeButton: false,
    maxWidth: '480px',
    // offset: 8,
};

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

const indicatorKeySelector = (indicator: Indicator) => indicator.id;
const indicatorLabelSelector = (indicator: Indicator) => indicator.fullTitle;
// const indicatorGroupKeySelector = (indicator: Indicator) => indicator.category;

const layerKeySelector = (d: Layer) => d.id;
const layerLabelSelector = (d: Layer) => d.name;

interface Props {
    className?: string;
}

const Dashboard = (props: Props) => {
    const { className } = props;
    const {
        regionLevel,
        setRegionLevel,
        programs,
    } = useContext(DomainContext);

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

    // Show/hide filters
    const [isFilterMinimized, , , toggleFilterMinimized] = useBasicToggle();
    const [regionFilterShown, , , toggleRegionFilter] = useBasicToggle();
    const [mapFilterShown, , , toggleMapFilter] = useBasicToggle();

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

    const indicatorList = indicatorListResponse?.results.filter(
        indicator => indicator.federalLevel === 'all' || indicator.federalLevel === regionLevel,
    );

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

    const [
        fiveWMapStatePending,
        fiveWMapState,
        fiveWStats,
    ] = useMapStateForFiveW(
        regionLevel,
        programs,
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

            return true;
        },
        [setClickedRegionProperties],
    );

    const handleTooltipClose = useCallback(
        () => {
            setClickedRegionProperties(undefined);
        },
        [setClickedRegionProperties],
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

    return (
        <div className={_cs(
            styles.dashboard,
            className,
            printMode && styles.printMode,
        )}
        >
            <PrintDetailsBar
                show={printMode}
                title={titleForPrintBar}
                description={selectedIndicatorDetails?.abstract}
            />
            <div className={styles.mainContent}>
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
                    // hideTooltipOnHover
                >
                    {clickedRegionProperties && (
                        <MapTooltip
                            coordinates={clickedRegionProperties.lngLat}
                            tooltipOptions={onClickTooltipOptions}
                            onHide={handleTooltipClose}
                        >
                            <Tooltip
                                feature={clickedRegionProperties.feature}
                                regionLevel={regionLevel}
                                programs={programs}
                            />
                        </MapTooltip>
                    )}
                </IndicatorMap>
            </div>
            <div
                className={_cs(
                    styles.filtersByRegion,
                    isFilterMinimized && styles.filterMinimized,
                )}
            >
                <Button
                    className={styles.button}
                    icons={<MdFilterList />}
                    onClick={toggleRegionFilter}
                >
                    Filters
                </Button>
                {regionFilterShown && (
                    <RegionSelector
                        className={styles.regionSelectorContainer}
                        onRegionLevelChange={setRegionLevel}
                        regionLevel={regionLevel}
                        searchHidden
                    />
                )}
            </div>

            <div className={styles.filtersByMap}>
                <Button
                    className={styles.button}
                    onClick={toggleMapFilter}
                >
                    Map Options
                </Button>
                {mapFilterShown && (
                    <div className={styles.mapSelectorContainer}>
                        <SelectInput
                            placeholder="DFID Data"
                            className={styles.inputItem}
                            options={fiveWOptions}
                            onChange={handleFiveWOptionChange}
                            value={selectedFiveWOption}
                            optionLabelSelector={fiveWLabelSelector}
                            optionKeySelector={fiveWKeySelector}
                        />
                        <SelectInput
                            placeholder="Indicator"
                            className={styles.inputItem}
                            disabled={indicatorListPending}
                            options={indicatorList}
                            onChange={setSelectedIndicator}
                            value={validSelectedIndicator}
                            optionLabelSelector={indicatorLabelSelector}
                            optionKeySelector={indicatorKeySelector}
                            // groupKeySelector={indicatorGroupKeySelector}
                            pending={indicatorListPending}
                        />
                        {selectedIndicatorDetails && selectedIndicatorDetails.abstract && (
                            <div className={styles.abstract}>
                                { selectedIndicatorDetails.abstract }
                            </div>
                        )}
                        <ToggleButton
                            label="Toggle Choropleth/Bubble"
                            className={styles.inputItem}
                            value={mapStyleInverted}
                            onChange={setMapStyleInverted}
                        />
                        <div className={styles.separator} />
                        <MultiSelectInput
                            placeholder="Layers"
                            className={styles.inputItem}
                            disabled={mapLayerListPending}
                            options={vectorLayers}
                            onChange={setSelectedVectorLayers}
                            value={selectedVectorLayers}
                            optionKeySelector={layerKeySelector}
                            optionLabelSelector={layerLabelSelector}
                        />
                        <SelectInput
                            placeholder="Background Layer"
                            className={styles.inputItem}
                            disabled={mapLayerListPending}
                            options={rasterLayers}
                            onChange={setSelectedRasterLayer}
                            value={selectedRasterLayer}
                            optionKeySelector={layerKeySelector}
                            optionLabelSelector={layerLabelSelector}
                        />
                    </div>
                )}
            </div>

            <Summary
                className={styles.summary}
            />
            <ExploreData
                className={styles.exploreData}
            />
            <div
                className={_cs(
                    styles.mapStyleConfigContainer,
                    isFilterMinimized && styles.filterMinimized,
                )}
            >
                <Button
                    className={styles.toggleVisibilityButton}
                    onClick={toggleFilterMinimized}
                    icons={isFilterMinimized ? <IoIosArrowForward /> : <IoIosArrowBack />}
                    transparent
                />
                <FiltersPanel
                    className={styles.filtersPanel}
                    // FIXME: rename to minimized
                    isMinimized={isFilterMinimized}
                />
            </div>
            <PrintButton
                orientation="portrait"
                className={styles.printModeButton}
                printMode={printMode}
                onPrintModeChange={setPrintMode}
            />
            <div
                className={_cs(
                    styles.legendContainer,
                    isFilterMinimized && styles.filterMinimized,
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
                {selectedVectorLayersDetail && selectedVectorLayersDetail.length > 0 && (
                    <VectorLegend
                        className={styles.legend}
                        vectorLayers={selectedVectorLayersDetail}
                    />
                )}
            </div>
            {hash === 'regions' && (
                <RegionDetails
                    indicatorListPending={indicatorListPending}
                    indicatorList={indicatorList}
                />
            )}
            {hash === 'programs' && (
                <ProgramDetails />
            )}
        </div>
    );
};

export default Dashboard;
