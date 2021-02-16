import React, { useMemo, useContext, useState, useEffect, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    IoIosClose,
    IoIosInformationCircleOutline,
    IoIosArrowForward,
    IoIosArrowBack,
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
import useMapStateForIndicator from './useMapStateForIndicator';
import FiltersPanel from './FiltersPanel';

import {
    FiveWOptionKey,
    FiveWOption,
    isFiveWOptionKey,
    HospitalType,
    Season,
    TravelTimeType,
    CovidFields,
} from './types';

import styles from './styles.css';

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
    // offset: 8,
    maxWidth: '480px',
};

const catchmentLegend = {
    [fourHourColor]: 4,
    [eightHourColor]: 8,
    [twelveHourColor]: 12,
};
const uncoveredLegend = {
    [twelveHourUncoveredColor]: '> 12',
    [eightHourUncoveredColor]: '> 8',
    [fourHourUncoveredColor]: '> 4',
};

const staticFiveWOptions: FiveWOption[] = [
    {
        key: 'allocatedBudget',
        label: 'Allocated Budget',
        unit: '£',
        category: 'General',
    },
    {
        key: 'programCount',
        label: 'Programs',
        datatype: 'integer',
        category: 'General',
        unit: 'Count',
    },
    {
        key: 'partnerCount',
        label: 'Partners',
        datatype: 'integer',
        category: 'General',
        unit: 'Count',
    },
    {
        key: 'componentCount',
        label: 'Components',
        datatype: 'integer',
        category: 'General',
        unit: 'Count',
    },
    {
        key: 'sectorCount',
        label: 'Sectors',
        datatype: 'integer',
        category: 'General',
        unit: 'Count',
    },
];

const hospitalTypeOptions: HospitalType[] = [
    { key: 'deshosp', label: 'Level Hospitals' },
    { key: 'allcovidhfs', label: 'All Covid Clinics' },
];

const seasonOptions: Season[] = [
    { key: 'dry', label: 'Dry' },
    { key: 'msn', label: 'Monsoon' },
];

const travelTimeTypeOptions: TravelTimeType[] = [
    { key: 'catchment', label: 'Catchment' },
    { key: 'uncovered', label: 'Uncovered' },
];

const fiveWKeySelector = (option: FiveWOption) => option.key;
const fiveWLabelSelector = (option: FiveWOption) => option.label;
const fiveWGroupKeySelector = (indicator: FiveWOption) => indicator.category;

const legendKeySelector = (option: LegendItem) => option.radius;
const legendValueSelector = (option: LegendItem) => option.value;
const legendRadiusSelector = (option: LegendItem) => option.radius;

const indicatorKeySelector = (indicator: Indicator) => indicator.id;
const indicatorLabelSelector = (indicator: Indicator) => indicator.fullTitle;
const indicatorGroupKeySelector = (indicator: Indicator) => indicator.category;

const layerKeySelector = (d: Layer) => d.id;
const layerLabelSelector = (d: Layer) => d.name;

const hospitalTypeKeySelector = (hospitalType: HospitalType) => hospitalType.key;
const hospitalTypeLabelSelector = (hospitalType: HospitalType) => hospitalType.label;

const seasonKeySelector = (season: Season) => season.key;
const seasonLabelSelector = (season: Season) => season.label;

const travelTimeTypeKeySelector = (travelTimeType: TravelTimeType) => travelTimeType.key;
const travelTimeTypeLabelSelector = (travelTimeType: TravelTimeType) => travelTimeType.label;

interface Props {
    className?: string;
}

const Dashboard = (props: Props) => {
    const { className } = props;
    const {
        regionLevel,
        setRegionLevel,
        covidMode,
        setCovidMode,
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
        selectedFiveWSubOption,
        setFiveWSubOption,
    ] = useState<string | undefined>();
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
    // Filter health
    const [
        showHealthResource,
        setShowHealthResource,
    ] = useState<boolean>(true);
    const [
        selectedHospitalType,
        setHospitalType,
    ] = useState<HospitalType['key']>('deshosp');
    const [
        selectedHospitals,
        setSelectedHospitals,
    ] = useState<string[]>([]);
    const [
        selectedSeason,
        setSeason,
    ] = useState<Season['key']>('dry');
    const [
        showHealthTravelTime,
        setShowHealthTravelTime,
    ] = useState<boolean>(false);
    const [
        selectedTravelTimeType,
        setTravelTimeType,
    ] = useState<TravelTimeType['key']>('catchment');
    // tooltip
    const [
        clickedRegionProperties,
        setClickedRegionProperties,
    ] = useState<ClickedRegion | undefined>();
    // info visibility
    const [
        ttInfoVisibility,
        setTtInfoVisbility,
    ] = useState(false);
    // print
    const [
        printMode,
        setPrintMode,
    ] = useState(false);
    // Show/hide filters
    const [
        isFilterMinimized,
        setFilterMinimized,
    ] = useState(false);
    const handleToggleFilterButtonClick = React.useCallback(() => {
        setFilterMinimized(prevValue => !prevValue);
    }, [setFilterMinimized]);

    const covidFields = covidMode ? `${apiEndPoint}/core/covid-fields/` : undefined;
    const [
        covidFieldsPending,
        covidFieldsResponse,
    ] = useRequest<CovidFields>(covidFields, 'covid-fields');

    const fiveWOptions = useMemo(
        () => {
            if (!covidFieldsResponse || !covidMode) {
                return staticFiveWOptions;
            }
            const dynamicMapping: FiveWOption[] = covidFieldsResponse.field.map(item => ({
                key: item.value,
                label: item.name,
                datatype: 'integer',
                unit: 'Program count',
                category: 'Covid Related',
            }));
            return [
                ...staticFiveWOptions,
                ...dynamicMapping,
            ];
        },
        [covidMode, covidFieldsResponse],
    );

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

    const indicatorListGetUrl = `${apiEndPoint}/core/indicator-list/?${covidMode ? 'is_covid=true' : 'is_dashboard=true'}`;
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

            const programCountOption: FiveWOptionKey = 'programCount';

            return isFiveWOptionKey(selectedFiveWOption)
                ? selectedFiveWOption
                : programCountOption;
        },
        [selectedFiveWOption],
    );

    const filterValue = selectedFiveWOption && !isFiveWOptionKey(selectedFiveWOption)
        ? { field: selectedFiveWOption, value: selectedFiveWSubOption }
        : undefined;

    const [
        fiveWMapStatePending,
        fiveWMapState,
        fiveWStats,
    ] = useMapStateForFiveW(
        regionLevel,
        programs,
        fiveWOptionKey,
        false,
        filterValue,
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
        fiveWOptions,
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

    const enableHealthResources = showHealthResource && covidMode;

    const showTravelTimeChoropleth = (
        enableHealthResources
        && showHealthTravelTime
    );

    const hash = useHash();

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

    const handleFiveWOptionChange = useCallback(
        (fiveWOption: string | undefined) => {
            if (fiveWOption && !isFiveWOptionKey(fiveWOption)) {
                if (fiveWOption === 'kathmandu_activity') {
                    setFiveWSubOption(covidFieldsResponse?.kathmanduActivity[0]);
                } else {
                    setFiveWSubOption(covidFieldsResponse?.other[0]);
                }
            } else {
                setFiveWSubOption(undefined);
            }
            setFiveWOption(fiveWOption);
        },
        [covidFieldsResponse],
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

    const handleTtInfoVisibilityChange = useCallback(
        () => {
            setTtInfoVisbility(!ttInfoVisibility);
        },
        [setTtInfoVisbility, ttInfoVisibility],
    );

    const handleHospitalToggle = useCallback(
        (name: string | undefined) => {
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
        },
        [],
    );

    const handleHospitalClick = useCallback(
        (
            feature: mapboxgl.MapboxGeoJSONFeature,
        ) => {
            type SelectedHospital = GeoJSON.Feature<GeoJSON.Point, DesignatedHospital>;
            const { properties: { name } } = feature as unknown as SelectedHospital;
            handleHospitalToggle(name);
            return true;
        },
        [handleHospitalToggle],
    );

    // NOTE: clear tooltip on region change
    useEffect(
        () => {
            setClickedRegionProperties(undefined);
        },
        [regionLevel],
    );

    // NOTE: clear hospitals on hospital type change
    useEffect(
        () => {
            setSelectedHospitals([]);
        },
        [selectedHospitalType],
    );

    return (
        <div className={_cs(
            styles.dashboard,
            className,
            printMode && styles.printMode,
        )}
        >
            {/* <SubNavbar>
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
            </SubNavbar> */}
            <PrintDetailsBar
                show={printMode}
                title={titleForPrintBar}
                description={selectedIndicatorDetails?.abstract}
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
                    printMode={printMode}
                />
            </div>
            <PrintButton
                orientation="landscape"
                className={styles.printModeButton}
                printMode={printMode}
                onPrintModeChange={setPrintMode}
            />
            <div
                className={_cs(
                    styles.mapStyleConfigContainer,
                    isFilterMinimized && styles.filterMinimized,
                )}
            >
                <Button
                    className={styles.toggleVisibilityButton}
                    onClick={handleToggleFilterButtonClick}
                    icons={isFilterMinimized ? <IoIosArrowForward /> : <IoIosArrowBack />}
                    transparent
                />
                <FiltersPanel
                    className={styles.filtersPanel}
                    isMinimized={isFilterMinimized}
                />
                <div className={styles.filters}>
                    <RegionSelector
                        className={styles.regionSelector}
                        onRegionLevelChange={setRegionLevel}
                        regionLevel={regionLevel}
                        searchHidden
                    />
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
                                </div>
                            )}
                            {ttInfoVisibility && (
                                <div className={styles.abstract}>
                                    <TravelTimeDetails />
                                </div>
                            )}
                            <div className={styles.separator} />
                        </>
                    )}
                    <ToggleButton
                        label="Toggle Choropleth/Bubble"
                        className={styles.inputItem}
                        value={mapStyleInverted}
                        onChange={setMapStyleInverted}
                    />
                    <SelectInput
                        label="DFID Data"
                        className={styles.inputItem}
                        options={fiveWOptions}
                        onChange={handleFiveWOptionChange}
                        value={selectedFiveWOption}
                        optionLabelSelector={fiveWLabelSelector}
                        groupKeySelector={covidMode ? fiveWGroupKeySelector : undefined}
                        optionKeySelector={fiveWKeySelector}
                        pending={covidFieldsPending}
                    />
                    {selectedFiveWOption && !isFiveWOptionKey(selectedFiveWOption) && (
                        <SelectInput
                            label="DFID Data Options"
                            value={selectedFiveWSubOption}
                            onChange={setFiveWSubOption}
                            className={styles.inputItem}
                            optionKeySelector={item => item}
                            optionLabelSelector={item => item}
                            nonClearable
                            options={(
                                selectedFiveWOption === 'kathmandu_activity'
                                    ? covidFieldsResponse?.kathmanduActivity
                                    : covidFieldsResponse?.other
                            )}
                        />
                    )}
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
                        pending={indicatorListPending}
                    />
                    {selectedIndicatorDetails && selectedIndicatorDetails.abstract && (
                        <div className={styles.abstract}>
                            { selectedIndicatorDetails.abstract }
                        </div>
                    )}
                    <div className={styles.separator} />
                    <MultiSelectInput
                        label="Layers"
                        className={styles.inputItem}
                        disabled={mapLayerListPending}
                        options={vectorLayers}
                        onChange={setSelectedVectorLayers}
                        value={selectedVectorLayers}
                        optionKeySelector={layerKeySelector}
                        optionLabelSelector={layerLabelSelector}
                    />
                    <SelectInput
                        label="Background Layer"
                        className={styles.inputItem}
                        disabled={mapLayerListPending}
                        options={rasterLayers}
                        onChange={setSelectedRasterLayer}
                        value={selectedRasterLayer}
                        optionKeySelector={layerKeySelector}
                        optionLabelSelector={layerLabelSelector}
                    />
                </div>
            </div>
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
                {showTravelTimeChoropleth && (
                    <>
                        {selectedTravelTimeType === 'catchment' && (
                            <ChoroplethLegend
                                title="Catchment"
                                className={styles.legend}
                                minValue=""
                                opacity={0.6}
                                unit="hours"
                                legend={catchmentLegend}
                            />
                        )}
                        {selectedTravelTimeType === 'uncovered' && (
                            <ChoroplethLegend
                                title="Uncovered"
                                className={styles.legend}
                                minValue=""
                                opacity={0.6}
                                unit="hours"
                                legend={uncoveredLegend}
                            />
                        )}
                    </>
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
