import React, { useMemo, useContext, useState, useEffect, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    IoIosClose,
    IoIosInformationCircleOutline,
} from 'react-icons/io';

import MapTooltip from '#remap/MapTooltip';

import BubbleLegend, { BubbleLegendType } from '#components/BubbleLegend';
import SegmentInput from '#components/SegmentInput';
import Button from '#components/Button';
import ChoroplethLegend from '#components/ChoroplethLegend';
import DomainContext from '#components/DomainContext';
import IndicatorMap from '#components/IndicatorMap';
import { SubNavbar } from '#components/Navbar';
import PrintButton from '#components/PrintButton';
import PrintDetailsBar from '#components/PrintDetailsBar';
import ProgramSelector from '#components/ProgramSelector';
import RasterLegend from '#components/RasterLegend';
import RegionSelector from '#components/RegionSelector';
import SelectInput from '#components/SelectInput';
import ToggleButton from '#components/ToggleButton';

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

import TravelTimeLayer, {
    DesignatedHospital,
    TravelTimeDetails,
} from './TravelTimeLayer';
import {
    fourHourColor,
    eightHourColor,
    twelveHourColor,
    fourHourUncoveredColor,
    eightHourUncoveredColor,
    twelveHourUncoveredColor,
} from './TravelTimeLayer/mapTheme';

import Tooltip from './Tooltip';
import Sidepanel from './Sidepanel';
import useMapStateForFiveW from './useMapStateForFiveW';

import {
    FiveWOptionKey,
    FiveWOption,
    HospitalType,
    Season,
    TravelTimeType,
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

const hospitalTypeOptions: HospitalType[] = [
    { key: 'deshosp', label: 'Covid Designated' },
    { key: 'allcovidhfs', label: 'All' },
];
const hospitalTypeKeySelector = (hospitalType: HospitalType) => hospitalType.key;
const hospitalTypeLabelSelector = (hospitalType: HospitalType) => hospitalType.label;

const seasonOptions: Season[] = [
    { key: 'dry', label: 'Dry' },
    { key: 'msn', label: 'Monsoon' },
];
const seasonKeySelector = (season: Season) => season.key;
const seasonLabelSelector = (season: Season) => season.label;

const travelTimeTypeOptions: TravelTimeType[] = [
    { key: 'catchment', label: 'Catchment' },
    { key: 'uncovered', label: 'Uncovered' },
];
const travelTimeTypeKeySelector = (travelTimeType: TravelTimeType) => travelTimeType.key;
const travelTimeTypeLabelSelector = (travelTimeType: TravelTimeType) => travelTimeType.label;

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
    const { regionLevel, covidMode, setCovidMode } = useContext(DomainContext);

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
    ] = useState<ClickedRegion | undefined>();

    const [showHealthResource, setShowHealthResource] = useState<boolean>(true);
    const [showHealthTravelTime, setShowHealthTravelTime] = useState<boolean>(false);
    const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
    const [selectedSeason, setSeason] = useState<Season['key']>('dry');
    const [selectedTravelTimeType, setTravelTimeType] = useState<TravelTimeType['key']>('catchment');
    const [selectedHospitalType, setHospitalType] = useState<HospitalType['key']>('deshosp');

    const enableHealthResources = showHealthResource && covidMode;

    const [selectedLayer, setSelectedLayer] = useState<number | undefined>(undefined);

    const [mapStyleInverted, setMapStyleInverted] = useState(false);

    // TODO: use is_covid=true if covidMode after server is fixed
    const indicatorListGetUrl = `${apiEndPoint}/core/indicator-list/?is_covid=${covidMode}`;
    const [
        indicatorListPending,
        indicatorListResponse,
    ] = useRequest<MultiResponse<Indicator>>(indicatorListGetUrl, 'indicator-list');

    const indicatorList = indicatorListResponse?.results.filter(
        indicator => indicator.federalLevel === 'all' || indicator.federalLevel === regionLevel,
    );
    const validSelectedIndicator = (
        isDefined(selectedIndicator)
        && indicatorList?.find(indicator => indicator.id === selectedIndicator)
    )
        ? selectedIndicator
        : undefined;

    const mapLayerGetUrl = `${apiEndPoint}/core/map-layer/`;
    const [
        mapLayerListPending,
        mapLayerListResponse,
    ] = useRequest<MultiResponse<Layer>>(mapLayerGetUrl, 'map-layer-list');

    const [
        indicatorMapStatePending,
        indicatorMapState,
    ] = useMapStateForIndicator(regionLevel, validSelectedIndicator);

    const [
        fiveWMapStatePending,
        fiveWMapState,
        fiveWStats,
    ] = useMapStateForFiveW(regionLevel, selectedFiveWOption);


    // NOTE: clear tooltip on region change
    useEffect(
        () => {
            setClickedRegionProperties(undefined);
        },
        [regionLevel],
    );

    useEffect(
        () => {
            setSelectedHospitals([]);
        },
        [selectedHospitalType],
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
        const indicator = indicatorList?.find(
            i => indicatorKeySelector(i) === validSelectedIndicator,
        );
        const indicatorTitle = indicator && indicatorLabelSelector(indicator);

        const fiveW = fiveWOptions.find(i => fiveWKeySelector(i) === selectedFiveWOption);
        const fiveWTitle = fiveW && fiveWLabelSelector(fiveW);

        const title = [fiveWTitle, indicatorTitle].filter(isDefined).join(' & ');

        if (mapStyleInverted) {
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
        mapStyleInverted,
        indicatorMapState,
        fiveWMapState,
        validSelectedIndicator,
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
            if (validSelectedIndicator) {
                return indicatorListResponse?.results.find(
                    d => d.id === validSelectedIndicator,
                );
            }
            return undefined;
        },
        [validSelectedIndicator, indicatorListResponse],
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

    const showTravelTimeChoropleth = (
        enableHealthResources
        && showHealthTravelTime
    );

    const showLegend = (
        bubbleLegend.length > 0
        || Object.keys(mapLegend).length > 0
        || showTravelTimeChoropleth
        || selectedRasterLayer
    );

    const handleMapRegionOnClick = useCallback(
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

    const dfidData = useMemo(
        () => {
            if (!clickedRegionProperties) {
                return undefined;
            }
            const { id } = clickedRegionProperties.feature;
            const code = String(id);
            return fiveWStats.find(v => v.code === code);
        },
        [fiveWStats, clickedRegionProperties],
    );

    const indicatorData = useMemo(
        () => {
            if (!selectedIndicatorDetails || !clickedRegionProperties) {
                return undefined;
            }

            const { id } = clickedRegionProperties.feature;

            const indicatorValue = indicatorMapState.find(v => v.id === id)?.value;

            return {
                ...selectedIndicatorDetails,
                value: indicatorValue,
            };
        },
        [indicatorMapState, selectedIndicatorDetails, clickedRegionProperties],
    );

    const [ttInfoVisibility, setTtInfoVisbility] = useState(false);
    const handleTtInfoVisibilityChange = useCallback(
        () => {
            setTtInfoVisbility(!ttInfoVisibility);
        },
        [setTtInfoVisbility, ttInfoVisibility],
    );

    // FIXME: use useCallback
    const handleHospitalToggle = (
        name: string | undefined,
    ) => {
        if (!name) {
            return;
        }
        setSelectedHospitals((hospitals) => {
            const hospitalIndex = hospitals.findIndex(hospital => hospital === name);
            if (hospitalIndex !== -1) {
                const newHospitals = [...hospitals];
                newHospitals.splice(hospitalIndex, 1);
                return newHospitals;
            }
            return [...hospitals, name];
        });
    };

    // FIXME: use useCallback
    const handleHospitalClick = (
        feature: mapboxgl.MapboxGeoJSONFeature,
    ) => {
        type SelectedHospital = GeoJSON.Feature<GeoJSON.Point, DesignatedHospital>;
        const { properties: { name } } = feature as unknown as SelectedHospital;
        handleHospitalToggle(name);
        return true;
    };

    return (
        <div className={_cs(
            styles.dashboard,
            className,
            printMode && styles.printMode,
        )}
        >
            <SubNavbar>
                <div className={styles.subNavbar}>
                    <ProgramSelector className={styles.programSelector} />
                    <div className={styles.actions}>
                        <ToggleButton
                            label="Show COVID-19 Data"
                            className={styles.inputItem}
                            value={covidMode}
                            onChange={setCovidMode}
                        />
                    </div>
                </div>
            </SubNavbar>
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
            <div className={styles.mainContent}>
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
                    {enableHealthResources && (
                        <TravelTimeLayer
                            key={`${selectedSeason}-${selectedHospitalType}`}
                            prefix={`${selectedSeason}-${selectedHospitalType}`}
                            season={selectedSeason}
                            hospitalType={selectedHospitalType}
                            onHospitalClick={handleHospitalClick}
                            selectedHospitals={selectedHospitals}
                            travelTimeShown={showHealthTravelTime}
                            travelTimeType={selectedTravelTimeType}
                        />
                    )}
                </IndicatorMap>
                <Sidepanel
                    className={styles.sidebar}
                    fiveWList={fiveWStats}
                />
            </div>
            <div className={styles.mapStyleConfigContainer}>
                <RegionSelector searchHidden />
                <div className={styles.separator} />
                {covidMode && (
                    <>
                        <div>
                            <ToggleButton
                                className={styles.inputItem}
                                label="Show health facilities"
                                value={showHealthResource}
                                onChange={setShowHealthResource}
                            />
                            <div className={styles.travelTimeInputContainer}>
                                <ToggleButton
                                    label="Show travel time information"
                                    disabled={!showHealthResource}
                                    value={showHealthTravelTime && showHealthResource}
                                    onChange={setShowHealthTravelTime}
                                />
                                <Button
                                    onClick={handleTtInfoVisibilityChange}
                                    transparent
                                    icons={(
                                        <IoIosInformationCircleOutline />
                                    )}
                                />
                            </div>
                        </div>
                        {enableHealthResources && (
                            <div>
                                <SegmentInput
                                    label="Hospitals"
                                    className={styles.inputItem}
                                    options={hospitalTypeOptions}
                                    onChange={setHospitalType}
                                    value={selectedHospitalType}
                                    optionLabelSelector={hospitalTypeLabelSelector}
                                    optionKeySelector={hospitalTypeKeySelector}
                                />
                                {selectedHospitals.length > 0 && (
                                    <div className={styles.hospitals}>
                                        {selectedHospitals.map(hospital => (
                                            <Button
                                                className={styles.button}
                                                key={hospital}
                                                name={hospital}
                                                onClick={handleHospitalToggle}
                                                icons={(
                                                    <IoIosClose />
                                                )}
                                            >
                                                {hospital}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {enableHealthResources && showHealthTravelTime && (
                            <div>
                                <SegmentInput
                                    label="Travel Time Type"
                                    className={styles.inputItem}
                                    options={travelTimeTypeOptions}
                                    onChange={setTravelTimeType}
                                    value={selectedTravelTimeType}
                                    optionLabelSelector={travelTimeTypeLabelSelector}
                                    optionKeySelector={travelTimeTypeKeySelector}
                                />
                                <SegmentInput
                                    label="Travel Time Season"
                                    className={styles.inputItem}
                                    options={seasonOptions}
                                    onChange={setSeason}
                                    value={selectedSeason}
                                    optionLabelSelector={seasonLabelSelector}
                                    optionKeySelector={seasonKeySelector}
                                />
                                {ttInfoVisibility && (
                                    <div className={styles.abstract}>
                                        <TravelTimeDetails />
                                    </div>
                                )}
                            </div>
                        )}
                        <div className={styles.separator} />
                    </>
                )}
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
                    value={validSelectedIndicator}
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
                    value={mapStyleInverted}
                    onChange={setMapStyleInverted}
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
                    {showTravelTimeChoropleth && (
                        <>
                            {selectedTravelTimeType === 'catchment' && (
                                <ChoroplethLegend
                                    title="Catchment"
                                    className={styles.legend}
                                    minValue=""
                                    opacity={0.6}
                                    unit="hours"
                                    legend={{
                                        [fourHourColor]: 4,
                                        [eightHourColor]: 8,
                                        [twelveHourColor]: 12,
                                    }}
                                />
                            )}
                            {selectedTravelTimeType === 'uncovered' && (
                                <ChoroplethLegend
                                    title="Uncovered"
                                    className={styles.legend}
                                    minValue=""
                                    opacity={0.6}
                                    unit="hours"
                                    legend={{
                                        [twelveHourUncoveredColor]: '> 12',
                                        [eightHourUncoveredColor]: '> 8',
                                        [fourHourUncoveredColor]: '> 4',
                                    }}
                                />
                            )}
                        </>
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
