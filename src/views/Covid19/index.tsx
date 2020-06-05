import React, { useState, useContext, useMemo, useEffect } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import MapTooltip from '#remap/MapTooltip';

import RegionSelector from '#components/RegionSelector';
import SegmentInput from '#components/SegmentInput';
import DomainContext from '#components/DomainContext';
import SelectInput from '#components/SelectInput';
import ChoroplethLegend from '#components/ChoroplethLegend';
import ToggleButton from '#components/ToggleButton';
import BubbleLegend, { BubbleLegendType } from '#components/BubbleLegend';
import IndicatorMap from '#components/IndicatorMap';
import PrintButton from '#components/PrintButton';
import PrintDetailsBar from '#components/PrintDetailsBar';
import RasterLegend from '#components/RasterLegend';

import useRequest from '#hooks/useRequest';

import useMapStateForIndicator from './useMapStateForIndicator';
import useMapStateForCovidFiveW from './useMapStateForCovidFiveW';

import {
    Layer,
    LegendItem,
    MultiResponse,
    Indicator,
    isRasterLayer,
} from '#types';

import {
    generateChoroplethMapPaintAndLegend,
    generateBubbleMapPaintAndLegend,
    filterMapState,
} from '#utils/common';
import {
    colorDomain,
    apiEndPoint,
} from '#utils/constants';

import Stats from './Stats';


import Tooltip from './Tooltip';
import {
    FiveWOption,
    AgeGroup,
    AgeGroupOption,
    CovidFiveWOptionKey,
} from './types';

import styles from './styles.css';

const legendKeySelector = (option: LegendItem) => option.radius;
const legendValueSelector = (option: LegendItem) => option.value;
const legendRadiusSelector = (option: LegendItem) => option.radius;

const fiveWOptions: FiveWOption[] = [
    {
        key: 'component',
        label: 'No. of components',
        datatype: 'integer',
    },
    {
        key: 'sector',
        label: 'No. of sectors',
        datatype: 'integer',
    },
];
const fiveWKeySelector = (option: FiveWOption) => option.key;
const fiveWLabelSelector = (option: FiveWOption) => option.label;

const indicatorKeySelector = (indicator: Indicator) => indicator.id;
const indicatorLabelSelector = (indicator: Indicator) => indicator.fullTitle;
const indicatorGroupKeySelector = (indicator: Indicator) => indicator.category;

const ageGroupOptions: AgeGroup[] = [
    { key: 'belowFourteen', label: 'Below 14', tooltipLabel: 'Number of People Aged Below 14' },
    { key: 'fifteenToFourtyNine', label: '15 to 49', tooltipLabel: 'Number of Peple Aged From 15 to 49' },
    { key: 'aboveFifty', label: 'Above 50', tooltipLabel: 'Number of People Aged Above 50' },
];
const ageGroupKeySelector = (ageGroup: AgeGroup) => ageGroup.key;
const ageGroupLabelSelector = (ageGroup: AgeGroup) => ageGroup.label;
const ageGroupTooltipLabelSelector = (ageGroup: AgeGroup) => ageGroup.tooltipLabel;

const layerKeySelector = (d: Layer) => d.id;
const layerLabelSelector = (d: Layer) => d.name;

const onClickTooltipOptions: mapboxgl.PopupOptions = {
    closeOnClick: true,
    closeButton: false,
    offset: 8,
    maxWidth: '480px',
};

interface Props {
    className?: string;
}

function Covid19(props: Props) {
    const { className } = props;
    const { regionLevel } = useContext(DomainContext);

    const [selectedFiveWOption, setFiveWOption] = useState<CovidFiveWOptionKey | undefined>('component');
    const [selectedIndicator, setSelectedIndicator] = useState<number | undefined>();
    const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroupOption>('belowFourteen');

    const [selectedLayer, setSelectedLayer] = useState<number | undefined>(undefined);

    const indicatorListGetUrl = `${apiEndPoint}/core/indicator-list/?is_covid=1`;
    const [indicatorListPending, indicatorListResponse] = useRequest<MultiResponse<Indicator>>(
        indicatorListGetUrl,
        'indicator-list',
    );
    const mapLayerGetUrl = `${apiEndPoint}/core/map-layer/`;
    const [
        mapLayerListPending,
        mapLayerListResponse,
    ] = useRequest<MultiResponse<Layer>>(mapLayerGetUrl, 'map-layer-list');

    const [
        mapStateForIndicatorPending,
        mapStateForIndicator,
    ] = useMapStateForIndicator(regionLevel, selectedIndicator, selectedAgeGroup);

    const [
        mapStateForFiveWPending,
        covidFiveWData,
    ] = useMapStateForCovidFiveW(regionLevel, selectedFiveWOption);

    const mapStateForFiveW = useMemo(
        () => (
            covidFiveWData.map(v => ({ id: v.id, value: v.value }))
        ),
        [covidFiveWData],
    );
    const [invertMapStyle, setInvertMapStyle] = useState(false);


    interface Region {
        name: string;
    }
    interface ClickedRegion {
        feature: GeoJSON.Feature<GeoJSON.Polygon, Region>;
        lngLat: mapboxgl.LngLatLike;
    }
    const [
        clickedRegionProperties,
        setClickedRegionProperties,
    ] = React.useState<ClickedRegion | undefined>();

    // NOTE: clear tooltip on region change
    useEffect(
        () => {
            setClickedRegionProperties(undefined);
        },
        [regionLevel],
    );

    const indicatorOptions = useMemo(
        () => {
            if (!indicatorListResponse?.results) {
                return undefined;
            }
            const options = [
                ...indicatorListResponse.results,
            ];
            options.push({
                id: -1,
                fullTitle: 'Age group',
                abstract: undefined,
                category: 'Demographics',
                federalLevel: 'all',
            });
            return options;
        },
        [indicatorListResponse],
    );

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
        const indicator = indicatorOptions?.find(
            i => indicatorKeySelector(i) === selectedIndicator,
        );
        const indicatorTitle = indicator && indicatorLabelSelector(indicator);

        const fiveW = fiveWOptions.find(i => fiveWKeySelector(i) === selectedFiveWOption);
        const fiveWTitle = fiveW && fiveWLabelSelector(fiveW);

        const title = [fiveWTitle, indicatorTitle].filter(isDefined).join(' & ');

        if (invertMapStyle) {
            return {
                choroplethMapState: mapStateForIndicator,
                choroplethTitle: indicatorTitle,
                choroplethInteger: indicator?.datatype === 'integer',
                choroplethUnit: indicator?.unit,

                bubbleMapState: mapStateForFiveW,
                bubbleTitle: fiveWTitle,
                bubbleInteger: fiveW?.datatype === 'integer',
                bubbleUnit: fiveW?.unit,

                titleForPrintBar: title,
            };
        }
        return {
            choroplethMapState: mapStateForFiveW,
            choroplethTitle: fiveWTitle,
            choroplethInteger: fiveW?.datatype === 'integer',
            choroplethUnit: fiveW?.unit,

            bubbleMapState: mapStateForIndicator,
            bubbleTitle: indicatorTitle,
            bubbleInteger: indicator?.datatype === 'integer',
            bubbleUnit: indicator?.unit,

            titleForPrintBar: title,
        };
    }, [
        invertMapStyle,
        mapStateForIndicator,
        mapStateForFiveW,
        selectedIndicator,
        selectedFiveWOption,
        indicatorOptions,
    ]);

    // const mapStatePending = mapStateForIndicatorPending || mapStateForFiveWPending;
    // const pending = mapStatePending || indicatorListPending;
    const indicatorData = useMemo(
        () => {
            if (isDefined(selectedIndicator)) {
                if (selectedIndicator === -1 && selectedAgeGroup) {
                    const ageGroup = ageGroupOptions.find(v => v.key === selectedAgeGroup);
                    const ageGroupLabel = ageGroup && ageGroupTooltipLabelSelector(ageGroup);
                    const ageGroupValue = mapStateForIndicator.find(
                        v => v.id === clickedRegionProperties?.feature.id,
                    )?.value;

                    return {
                        label: ageGroupLabel,
                        value: ageGroupValue,
                    };
                }

                const indicator = indicatorOptions?.find(
                    i => indicatorKeySelector(i) === selectedIndicator,
                );

                if (indicator) {
                    const indicatorTitle = indicatorLabelSelector(indicator);

                    const indicatorValue = mapStateForIndicator.find(
                        v => v.id === clickedRegionProperties?.feature.id,
                    )?.value;

                    return {
                        label: indicatorTitle,
                        value: indicatorValue,
                    };
                }
            }
            return undefined;
        },
        [
            selectedIndicator,
            clickedRegionProperties,
            indicatorOptions,
            mapStateForIndicator,
            selectedAgeGroup,
        ],
    );

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
                return indicatorOptions?.find(
                    d => d.id === selectedIndicator,
                );
            }
            return undefined;
        },
        [selectedIndicator, indicatorOptions],
    );


    const handleTooltipClose = React.useCallback(
        () => {
            setClickedRegionProperties(undefined);
        },
        [setClickedRegionProperties],
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

    const rasterLayers = useMemo(
        () => (mapLayerListResponse?.results.filter(isRasterLayer)),
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


    const dfidData = useMemo(
        () => covidFiveWData.find(v => v.id === clickedRegionProperties?.feature.id)?.data,
        [covidFiveWData, clickedRegionProperties],
    );

    return (
        <div className={_cs(
            styles.covid19,
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
                )
              */}
            <IndicatorMap
                className={styles.mapContainer}
                regionLevel={regionLevel}
                choroplethMapState={choroplethMapState}
                choroplethMapPaint={mapPaint}
                bubbleMapState={bubbleMapState}
                bubbleMapPaint={bubblePaint}
                rasterLayer={selectedRasterLayer}
                printMode={printMode}
                onClick={handleMapRegionOnClick}
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
                            dfidData={dfidData}
                            indicatorData={indicatorData}
                        />
                    </MapTooltip>
                )}
            </IndicatorMap>
            <Stats className={styles.stats} />
            <div className={styles.mapStyleConfigContainer}>
                <RegionSelector searchHidden />
                <div className={styles.separator} />
                <SelectInput
                    label="Evidence for Development"
                    options={fiveWOptions}
                    className={styles.inputItem}
                    onChange={setFiveWOption}
                    value={selectedFiveWOption}
                    optionLabelSelector={fiveWLabelSelector}
                    optionKeySelector={fiveWKeySelector}
                />
                <SelectInput
                    className={styles.inputItem}
                    label="Indicator"
                    disabled={indicatorListPending}
                    options={indicatorOptions}
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
                {selectedIndicator === -1 && (
                    <SegmentInput
                        label="Age range"
                        className={styles.inputItem}
                        options={ageGroupOptions}
                        onChange={setSelectedAgeGroup}
                        value={selectedAgeGroup}
                        optionLabelSelector={ageGroupLabelSelector}
                        optionKeySelector={ageGroupKeySelector}
                    />
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
}

export default Covid19;
