import React, { useState, useContext, useMemo, useEffect } from 'react';
import { IoIosClose } from 'react-icons/io';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import RegionSelector from '#components/RegionSelector';
import SegmentInput from '#components/SegmentInput';
import NavbarContext from '#components/NavbarContext';
import SelectInput from '#components/SelectInput';
import ChoroplethLegend from '#components/ChoroplethLegend';
import ToggleButton from '#components/ToggleButton';
import Button from '#components/Button';
import BubbleLegend from '#components/BubbleLegend';

import IndicatorMap from '#components/IndicatorMap';
import Stats from './Stats';

import useRequest from '#hooks/useRequest';
import useMapStateForIndicator from '#hooks/useMapStateForIndicator';
import useMapStateForCovidFiveW from '#hooks/useMapStateForCovidFiveW';

import {
    AgeGroupOption,
    MultiResponse,
    CovidFiveWOptionKey,
    LegendItem,
} from '#types';

import {
    generateChoroplethMapPaintAndLegend,
    generateBubbleMapPaintAndLegend,
} from '#utils/common';
import {
    colorDomain,
    apiEndPoint,
} from '#utils/constants';

import TravelTimeLayer, {
    DesignatedHospital,
} from './TravelTimeLayer';
import {
    fourHourColor,
    eightHourColor,
    twelveHourColor,
    fourHourUncoveredColor,
    eightHourUncoveredColor,
    twelveHourUncoveredColor,
} from './TravelTimeLayer/mapTheme';

import {
    FiveWOption,
    Indicator,
    AgeGroup,
    HospitalType,
    Season,
    TravelTimeType,
} from './types';

import styles from './styles.css';

const legendKeySelector = (option: LegendItem) => option.radius;
const legendValueSelector = (option: LegendItem) => option.value;
const legendRadiusSelector = (option: LegendItem) => option.radius;

const fiveWOptions: FiveWOption[] = [
    {
        key: 'projectName',
        label: 'No. of projects',
    },
    {
        key: 'sector',
        label: 'No. of sectors',
    },
];
const fiveWKeySelector = (option: FiveWOption) => option.key;
const fiveWLabelSelector = (option: FiveWOption) => option.label;

const indicatorKeySelector = (indicator: Indicator) => indicator.id;
const indicatorLabelSelector = (indicator: Indicator) => indicator.fullTitle;
const indicatorGroupKeySelector = (indicator: Indicator) => indicator.category;

const ageGroupOptions: AgeGroup[] = [
    { key: 'belowFourteen', label: 'Below 14' },
    { key: 'fifteenToFourtyNine', label: '15 to 49' },
    { key: 'aboveFifty', label: 'Above 50' },
];
const ageGroupKeySelector = (ageGroup: AgeGroup) => ageGroup.key;
const ageGroupLabelSelector = (ageGroup: AgeGroup) => ageGroup.label;

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

interface Props {
    className?: string;
}

function Covid19(props: Props) {
    const { className } = props;
    const { regionLevel } = useContext(NavbarContext);

    const [selectedFiveWOption, setFiveWOption] = useState<CovidFiveWOptionKey | undefined>('projectName');
    const [selectedIndicator, setSelectedIndicator] = useState<number | undefined>();
    const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroupOption>('belowFourteen');

    const [showHealthResource, setShowHealthResource] = useState<boolean>(true);
    const [showHealthTravelTime, setShowHealthTravelTime] = useState<boolean>(false);
    const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
    const [selectedSeason, setSeason] = useState<Season['key']>('dry');
    const [selectedTravelTimeType, setTravelTimeType] = useState<TravelTimeType['key']>('catchment');
    const [selectedHospitalType, setHospitalType] = useState<HospitalType['key']>('deshosp');

    const indicatorListGetUrl = `${apiEndPoint}/core/indicator-list/?is_covid=1`;
    const [indicatorListPending, indicatorListResponse] = useRequest<MultiResponse<Indicator>>(
        indicatorListGetUrl,
    );
    const indicatorList = indicatorListResponse?.results;

    const [
        mapStateForIndicatorPending,
        mapStateForIndicator,
    ] = useMapStateForIndicator(regionLevel, selectedIndicator, selectedAgeGroup);

    const [
        mapStateForFiveWPending,
        mapStateForFiveW,
    ] = useMapStateForCovidFiveW(regionLevel, selectedFiveWOption);

    const [invertMapStyle, setInvertMapStyle] = useState(false);

    const {
        choroplethMapState,
        bubbleMapState,
        choroplethTitle,
        bubbleTitle,
    } = useMemo(() => {
        const indicator = indicatorList?.find(i => indicatorKeySelector(i) === selectedIndicator);
        const indicatorTitle = indicator && indicatorLabelSelector(indicator);
        const fiveW = fiveWOptions.find(i => fiveWKeySelector(i) === selectedFiveWOption);
        const fiveWTitle = fiveW && fiveWLabelSelector(fiveW);

        if (invertMapStyle) {
            return {
                choroplethMapState: mapStateForIndicator,
                choroplethTitle: indicatorTitle,
                bubbleMapState: mapStateForFiveW,
                bubbleTitle: fiveWTitle,
            };
        }
        return {
            choroplethMapState: mapStateForFiveW,
            choroplethTitle: fiveWTitle,
            bubbleMapState: mapStateForIndicator,
            bubbleTitle: indicatorTitle,
        };
    }, [
        invertMapStyle,
        mapStateForIndicator,
        mapStateForFiveW,
        selectedIndicator,
        selectedFiveWOption,
        indicatorList,
    ]);

    // const mapStatePending = mapStateForIndicatorPending || mapStateForFiveWPending;
    // const pending = mapStatePending || indicatorListPending;

    const {
        paint: mapPaint,
        legend: mapLegend,
        min: dataMinValue,
    } = useMemo(
        () => {
            const valueList = choroplethMapState.map(d => d.value);
            const min = Math.min(...valueList);
            const max = Math.max(...valueList);

            return generateChoroplethMapPaintAndLegend(colorDomain, min, max);
        },
        [choroplethMapState],
    );

    const {
        mapPaint: bubblePaint,
        legend: bubbleLegend,
    } = useMemo(() => {
        const valueList = bubbleMapState
            .map(d => d.value)
            .filter(isDefined)
            .map(Math.abs);

        const min = valueList.length > 0 ? Math.min(...valueList) : undefined;
        const max = valueList.length > 0 ? Math.max(...valueList) : undefined;

        let maxRadius = 50;
        if (regionLevel === 'district') {
            maxRadius = 40;
        } else if (regionLevel === 'municipality') {
            maxRadius = 30;
        }

        return generateBubbleMapPaintAndLegend(min, max, maxRadius);
    }, [bubbleMapState, regionLevel]);

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

    const indicatorOptions = useMemo(
        () => {
            if (!indicatorListResponse?.results) {
                return undefined;
            }
            const options = [
                ...indicatorListResponse?.results,
            ];
            options.push({ id: -1, fullTitle: 'Age group', abstract: undefined, category: 'Demographics' });
            return options;
        },
        [indicatorListResponse],
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

    useEffect(
        () => {
            setSelectedHospitals([]);
        },
        [selectedHospitalType],
    );

    const showTravelTimeChoropleth = (
        showHealthResource
        && showHealthTravelTime
    );

    const showLegend = (
        bubbleLegend.length > 0
        || Object.keys(mapLegend).length > 0
        || showTravelTimeChoropleth
    );

    return (
        <div className={_cs(
            styles.covid19,
            className,
        )}
        >
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
            >
                {showHealthResource && (
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
            <Stats className={styles.stats} />
            <div className={styles.mapStyleConfigContainer}>
                <RegionSelector searchHidden />
                <div className={styles.separator} />
                <div className={styles.health}>
                    <ToggleButton
                        className={styles.inputItem}
                        label="Show health facilities"
                        value={showHealthResource}
                        onChange={setShowHealthResource}
                    />
                    {showHealthResource && (
                        <>
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
                            <ToggleButton
                                className={styles.inputItem}
                                label="Show travel time"
                                value={showHealthTravelTime}
                                onChange={setShowHealthTravelTime}
                            />
                            {showHealthTravelTime && (
                                <>
                                    <SegmentInput
                                        label="Type"
                                        className={styles.inputItem}
                                        options={travelTimeTypeOptions}
                                        onChange={setTravelTimeType}
                                        value={selectedTravelTimeType}
                                        optionLabelSelector={travelTimeTypeLabelSelector}
                                        optionKeySelector={travelTimeTypeKeySelector}
                                    />
                                    <SegmentInput
                                        label="Season"
                                        className={styles.inputItem}
                                        options={seasonOptions}
                                        onChange={setSeason}
                                        value={selectedSeason}
                                        optionLabelSelector={seasonLabelSelector}
                                        optionKeySelector={seasonKeySelector}
                                    />
                                </>
                            )}
                        </>
                    )}
                </div>
                <div className={styles.separator} />
                <SelectInput
                    label="DFID Data"
                    options={fiveWOptions}
                    className={styles.inputItem}
                    onChange={setFiveWOption}
                    value={selectedFiveWOption}
                    optionLabelSelector={fiveWLabelSelector}
                    optionKeySelector={fiveWKeySelector}
                />
                <SelectInput
                    className={_cs(styles.indicatorInput, styles.inputItem)}
                    label="Indicator"
                    placeholder="Select an indicator"
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
                        label="Selected range"
                        className={styles.ageGroupSelectInput}
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
            </div>
            {showLegend && (
                <div className={styles.legendContainer}>
                    <ChoroplethLegend
                        className={styles.legend}
                        title={choroplethTitle}
                        minValue={dataMinValue}
                        legend={mapLegend}
                    />
                    <BubbleLegend
                        className={styles.legend}
                        title={bubbleTitle}
                        data={bubbleLegend}
                        keySelector={legendKeySelector}
                        valueSelector={legendValueSelector}
                        radiusSelector={legendRadiusSelector}
                    />
                    {showTravelTimeChoropleth && (
                        <>
                            {selectedTravelTimeType === 'catchment' && (
                                <ChoroplethLegend
                                    title="Catchment"
                                    className={styles.legend}
                                    minValue=""
                                    opacity={0.6}
                                    legend={{
                                        [fourHourColor]: '4hrs',
                                        [eightHourColor]: '8hrs',
                                        [twelveHourColor]: '12hrs',
                                    }}
                                />
                            )}
                            {selectedTravelTimeType === 'uncovered' && (
                                <ChoroplethLegend
                                    title="Uncovered"
                                    className={styles.legend}
                                    minValue=""
                                    opacity={0.6}
                                    legend={{
                                        [twelveHourUncoveredColor]: '> 12hrs',
                                        [eightHourUncoveredColor]: '> 8hrs',
                                        [fourHourUncoveredColor]: '> 4hrs',
                                    }}
                                />
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default Covid19;
