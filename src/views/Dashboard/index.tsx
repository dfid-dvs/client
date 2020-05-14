import React, { useMemo, useContext, useState } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import MapTooltip from '#remap/MapTooltip';
import RegionSelector from '#components/RegionSelector';
import NavbarContext from '#components/NavbarContext';
import ToggleButton from '#components/ToggleButton';
import SelectInput from '#components/SelectInput';
import ChoroplethLegend from '#components/ChoroplethLegend';
import BubbleLegend, { BubbleLegendType } from '#components/BubbleLegend';
import IndicatorMap from '#components/IndicatorMap';
import PrintButton from '#components/PrintButton';
import PrintDetailsBar from '#components/PrintDetailsBar';
import RasterLegend from '#components/RasterLegend';

import useRequest from '#hooks/useRequest';
import useMapStateForIndicator from '#hooks/useMapStateForIndicator';

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
} from '#types';

import {
    colorDomain,
    apiEndPoint,
} from '#utils/constants';

import Stats from './Stats';
import Tooltip from './Tooltip';
import useMapStateForFiveW from './useMapStateForFiveW';

import {
    FiveWOptionKey,
    FiveWOption,
} from './types';

import styles from './styles.css';

const onClickTooltipOptions: mapboxgl.PopupOptions = {
    closeOnClick: true,
    closeButton: false,
    offset: 8,
    maxWidth: '480px',
};
const fiveWOptions: FiveWOption[] = [
    {
        key: 'allocatedBudget',
        label: 'Allocated Budget',
        unit: '£',
    },
    {
        key: 'maleBeneficiary',
        label: 'Male Beneficiary',
        datatype: 'integer',
    },
    {
        key: 'femaleBeneficiary',
        label: 'Female Beneficiary',
        datatype: 'integer',
    },
    {
        key: 'totalBeneficiary',
        label: 'Total Beneficiary',
        datatype: 'integer',
    },
];

const fiveWKeySelector = (option: FiveWOption) => option.key;
const fiveWLabelSelector = (option: FiveWOption) => option.label;

const legendKeySelector = (option: LegendItem) => option.radius;
const legendValueSelector = (option: LegendItem) => option.value;
const legendRadiusSelector = (option: LegendItem) => option.radius;

const indicatorKeySelector = (indicator: Indicator) => indicator.id;
const indicatorLabelSelector = (indicator: Indicator) => indicator.fullTitle;
const indicatorGroupKeySelector = (indicator: Indicator) => indicator.category;

const layerKeySelector = (d: Layer) => d.id;
const layerLabelSelector = (d: Layer) => d.name;

export interface Region {
    name: string;
}
export interface ClickedRegion {
    feature: GeoJSON.Feature<GeoJSON.Polygon, Region>;
    lngLat: mapboxgl.LngLatLike;
}

interface Props {
    className?: string;
}

const Dashboard = (props: Props) => {
    const { className } = props;
    const { regionLevel } = useContext(NavbarContext);

    const [
        selectedIndicator,
        setSelectedIndicator,
    ] = useState<number | undefined>(undefined);

    const [
        selectedFiveWOption,
        setFiveWOption,
    ] = useState<FiveWOptionKey | undefined>('allocatedBudget');

    const [
        clickedRegionProperties,
        setClickedRegionProperties,
    ] = React.useState<ClickedRegion | undefined>();

    const [selectedLayer, setSelectedLayer] = useState<number | undefined>(undefined);

    const [invertMapStyle, setInvertMapStyle] = useState(false);

    const indicatorListGetUrl = `${apiEndPoint}/core/indicator-list/`;
    const [
        indicatorListPending,
        indicatorListResponse,
    ] = useRequest<MultiResponse<Indicator>>(indicatorListGetUrl, 'indicator-list');
    const indicatorList = indicatorListResponse?.results;

    const mapLayerGetUrl = `${apiEndPoint}/core/map-layer/`;
    const [
        mapLayerListPending,
        mapLayerListResponse,
    ] = useRequest<MultiResponse<Layer>>(mapLayerGetUrl, 'map-layer-list');

    const [
        indicatorMapStatePending,
        indicatorMapState,
    ] = useMapStateForIndicator(regionLevel, selectedIndicator);

    const [
        fiveWMapStatePending,
        fiveWMapState,
        fivewStats,
    ] = useMapStateForFiveW(regionLevel, selectedFiveWOption);

    const {
        choroplethMapState,
        choroplethTitle,
        choroplethInteger,
        choroplethUnit,

        bubbleMapState,
        bubbleTitle,
        bubbleInteger,
        bubbleUnit,

        titleForPrintBar,
    } = useMemo(() => {
        const indicator = indicatorList?.find(i => indicatorKeySelector(i) === selectedIndicator);
        const indicatorTitle = indicator && indicatorLabelSelector(indicator);

        const fiveW = fiveWOptions.find(i => fiveWKeySelector(i) === selectedFiveWOption);
        const fiveWTitle = fiveW && fiveWLabelSelector(fiveW);

        const title = [fiveWTitle, indicatorTitle].filter(isDefined).join(' & ');

        if (invertMapStyle) {
            return {
                choroplethMapState: indicatorMapState,
                choroplethTitle: indicatorTitle,
                choroplethInteger: indicator?.datatype === 'integer',
                choroplethUnit: indicator?.unit,

                bubbleMapState: fiveWMapState,
                bubbleTitle: fiveWTitle,
                bubbleInteger: fiveW?.datatype === 'integer',
                bubbleUnit: fiveW?.unit,

                titleForPrintBar: title,
            };
        }
        return {
            choroplethMapState: fiveWMapState,
            choroplethTitle: fiveWTitle,
            choroplethInteger: fiveW?.datatype === 'integer',
            choroplethUnit: fiveW?.unit,

            bubbleMapState: indicatorMapState,
            bubbleTitle: indicatorTitle,
            bubbleInteger: indicator?.datatype === 'integer',
            bubbleUnit: indicator?.unit,

            titleForPrintBar: title,
        };
    }, [
        invertMapStyle,
        indicatorMapState,
        fiveWMapState,
        selectedIndicator,
        selectedFiveWOption,
        indicatorList,
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

    // const pending = mapStatePending || indicatorListPending;
    const {
        mapPaint: bubblePaint,
        legend: bubbleLegend,
        legendType: bubbleLegendType,
    } = useMemo(() => {
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
    }, [bubbleMapState, bubbleInteger, regionLevel]);

    const selectedIndicatorDetails = useMemo(
        () => {
            if (selectedIndicator) {
                return indicatorListResponse?.results.find(
                    d => d.id === selectedIndicator,
                );
            }
            return undefined;
        },
        [selectedIndicator, indicatorListResponse],
    );

    const rasterLayers = useMemo(
        () => (mapLayerListResponse?.results.filter(v => v.type === 'raster')),
        [mapLayerListResponse],
    );

    const selectedRasterLayer = useMemo(
        () => rasterLayers?.find(v => v.id === selectedLayer),
        [rasterLayers, selectedLayer],
    );
    const [printMode, setPrintMode] = useState(false);

    const showLegend = (
        bubbleLegend.length > 0
        || Object.keys(mapLegend).length > 0
        || selectedRasterLayer
    );

    const handleMapRegionOnClick = React.useCallback(
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

    const handleTooltipClose = React.useCallback(
        () => {
            setClickedRegionProperties(undefined);
        },
        [setClickedRegionProperties],
    );

    const dfidData = useMemo(
        () => fivewStats.find(v => v.id === clickedRegionProperties?.feature.id),
        [fivewStats, clickedRegionProperties],
    );

    const indicatorData = useMemo(
        () => {
            if (!selectedIndicatorDetails) {
                return undefined;
            }

            const indicatorValue = indicatorMapState.find(
                v => v.id === clickedRegionProperties?.feature.id,
            )?.value;

            return {
                ...selectedIndicatorDetails,
                value: indicatorValue,
            };
        },
        [indicatorMapState, selectedIndicatorDetails, clickedRegionProperties],
    );

    return (
        <div className={_cs(
            styles.dashboard,
            className,
            printMode && styles.printMode,
        )}
        >
            <PrintButton
                className={styles.printModeButton}
                printMode={printMode}
                onPrintModeChange={setPrintMode}
            />
            {/* pending && (
                <Backdrop className={styles.backdrop}>
                <LoadingAnimation />
                </Backdrop>
                ) */}
            <IndicatorMap
                className={styles.mapContainer}
                regionLevel={regionLevel}
                choroplethMapState={choroplethMapState}
                choroplethMapPaint={mapPaint}
                bubbleMapState={bubbleMapState}
                bubbleMapPaint={bubblePaint}
                rasterLayer={selectedRasterLayer}
                onClick={handleMapRegionOnClick}
                printMode={printMode}
                hideTooltipOnHover
            >
                {clickedRegionProperties && (
                    <MapTooltip
                        coordinates={clickedRegionProperties.lngLat}
                        tooltipOptions={onClickTooltipOptions}
                        onHide={handleTooltipClose}
                    >
                        <Tooltip
                            feature={clickedRegionProperties.feature}
                            dfidData={dfidData}
                            indicatorData={indicatorData}
                        />
                    </MapTooltip>
                )}
            </IndicatorMap>
            <Stats
                className={styles.stats}
                fiveW={fivewStats}
            />
            <div className={styles.mapStyleConfigContainer}>
                <RegionSelector searchHidden />
                <div className={styles.separator} />
                <SelectInput
                    label="DFID Data"
                    className={styles.inputItem}
                    options={fiveWOptions}
                    onChange={setFiveWOption}
                    value={selectedFiveWOption}
                    optionLabelSelector={fiveWLabelSelector}
                    optionKeySelector={fiveWKeySelector}
                />
                <SelectInput
                    label="Indicator"
                    className={styles.inputItem}
                    disabled={indicatorListPending}
                    options={indicatorList}
                    onChange={setSelectedIndicator}
                    value={selectedIndicator}
                    optionLabelSelector={indicatorLabelSelector}
                    optionKeySelector={indicatorKeySelector}
                    groupKeySelector={indicatorGroupKeySelector}
                />
                {selectedIndicatorDetails && selectedIndicatorDetails.abstract && (
                    <div className={styles.abstract}>
                        { selectedIndicatorDetails.abstract }
                    </div>
                )}
                <ToggleButton
                    label="Toggle Choropleth/Bubble"
                    className={styles.inputItem}
                    value={invertMapStyle}
                    onChange={setInvertMapStyle}
                />
                <div className={styles.separator} />
                <SelectInput
                    label="Background Layer"
                    className={styles.inputItem}
                    disabled={mapLayerListPending}
                    options={rasterLayers}
                    onChange={setSelectedLayer}
                    value={selectedLayer}
                    optionKeySelector={layerKeySelector}
                    optionLabelSelector={layerLabelSelector}
                />
            </div>
            {showLegend && (
                <div className={styles.legendContainer}>
                    <ChoroplethLegend
                        className={styles.legend}
                        title={choroplethTitle}
                        minValue={dataMinValue}
                        legend={mapLegend}
                        unit={choroplethUnit}
                        minExceeds={dataMinExceeds}
                        maxExceeds={dataMaxExceeds}
                    />
                    <BubbleLegend
                        className={styles.legend}
                        title={bubbleTitle}
                        data={bubbleLegend}
                        keySelector={legendKeySelector}
                        valueSelector={legendValueSelector}
                        radiusSelector={legendRadiusSelector}
                        legendType={bubbleLegendType}
                        unit={bubbleUnit}
                    />
                    {selectedRasterLayer && (
                        <RasterLegend
                            className={styles.legend}
                            rasterLayer={selectedRasterLayer}
                        />
                    )}
                </div>
            )}
            <PrintDetailsBar
                show={printMode}
                title={titleForPrintBar}
                description={selectedIndicatorDetails?.abstract}
            />
        </div>
    );
};

export default Dashboard;
