import React from 'react';
import { FiX } from 'react-icons/fi';
import { _cs } from '@togglecorp/fujs';

import RegionSelector from '#components/RegionSelector';
import SegmentInput from '#components/SegmentInput';
import NavbarContext from '#components/NavbarContext';
import SelectInput from '#components/SelectInput';
import ChoroplethLegend from '#components/ChoroplethLegend';
import ToggleButton from '#components/ToggleButton';
import Button from '#components/Button';

import IndicatorMap from '#components/IndicatorMap';
import Stats from './Stats';

import useRequest from '#hooks/useRequest';
import useMapStateForIndicator from '#hooks/useMapStateForIndicator';
import useMapStateForCovidFiveW from '#hooks/useMapStateForCovidFiveW';

import { AgeGroupOption, MultiResponse, CovidFiveWOptionKey } from '#types';

import { generateChoroplethMapPaintAndLegend } from '#utils/common';
import {
    colorDomain,
    apiEndPoint,
} from '#utils/constants';

import TravelTimeLayer, {
    DesignatedHospital,
    fourHourColor,
    eightHourColor,
    twelveHourColor,
} from './TravelTimeLayer';

import styles from './styles.css';

// FIXME: use from typings
interface Indicator {
    id: number;
    fullTitle: string;
    abstract: string | undefined;
}
const indicatorKeySelector = (indicator: Indicator) => indicator.id;
const indicatorLabelSelector = (indicator: Indicator) => indicator.fullTitle;

interface AgeGroup {
    key: AgeGroupOption;
    label: string;
}
const ageGroupOptions: AgeGroup[] = [
    { key: 'belowFourteen', label: 'Below 14' },
    { key: 'fifteenToFourtyNine', label: '15 to 49' },
    { key: 'aboveFifty', label: 'Above 50' },
];
const ageGroupKeySelector = (ageGroup: AgeGroup) => ageGroup.key;
const ageGroupLabelSelector = (ageGroup: AgeGroup) => ageGroup.label;

type Attribute = 'indicator' | 'fiveW';
interface AttributeOption {
    key: Attribute;
    label: string;
}
const attributeOptions: AttributeOption[] = [
    {
        key: 'fiveW',
        label: 'Dfid Data',
    },
    {
        key: 'indicator',
        label: 'Indicator',
    },
];
const attributeKeySelector = (option: AttributeOption) => option.key;
const attributeLabelSelector = (option: AttributeOption) => option.label;

interface FiveWOption {
    key: CovidFiveWOptionKey;
    label: string;
}
const fiveWOptions: FiveWOption[] = [
    {
        key: 'projectName',
        label: 'Project',
    },
    {
        key: 'sector',
        label: 'Sector',
    },
];
const fiveWKeySelector = (option: FiveWOption) => option.key;
const fiveWLabelSelector = (option: FiveWOption) => option.label;

interface Props {
    className?: string;
}

function Covid19(props: Props) {
    const { className } = props;
    const { regionLevel } = React.useContext(NavbarContext);

    const [selectedAttribute, setAttribute] = React.useState<Attribute>('fiveW');
    const [selectedFiveWOption, setFiveWOption] = React.useState<CovidFiveWOptionKey | undefined>('projectName');
    const [selectedIndicator, setSelectedIndicator] = React.useState<number | undefined>();
    const [selectedAgeGroup, setSelectedAgeGroup] = React.useState<AgeGroupOption>('belowFourteen');

    const [showHealthResource, setShowHealthResource] = React.useState<boolean>(true);
    const [showHealthTravelTime, setShowHealthTravelTime] = React.useState<boolean>(true);
    const [selectedHospitals, setSelectedHospitals] = React.useState<string[]>([]);

    const indicatorListGetUrl = `${apiEndPoint}/indicator-list/?is_covid=1`;
    const [indicatorListPending, indicatorListResponse] = useRequest<MultiResponse<Indicator>>(
        indicatorListGetUrl,
    );

    const [
        mapStateForIndicatorPending,
        mapStateForIndicator,
    ] = useMapStateForIndicator(regionLevel, selectedIndicator, selectedAgeGroup);

    const [
        mapStateForFiveWPending,
        mapStateForFiveW,
    ] = useMapStateForCovidFiveW(regionLevel, selectedFiveWOption);

    const mapState = selectedAttribute === 'indicator'
        ? mapStateForIndicator
        : mapStateForFiveW;

    // const mapStatePending = mapStateForIndicatorPending || mapStateForFiveWPending;
    // const pending = mapStatePending || indicatorListPending;

    const { paint: mapPaint, legend: mapLegend, min: dataMinValue } = React.useMemo(
        () => {
            const valueList = mapState.map(d => d.value);
            const min = Math.min(...valueList);
            const max = Math.max(...valueList);

            return {
                min,
                ...generateChoroplethMapPaintAndLegend(colorDomain, min, max),
            };
        },
        [mapState],
    );

    const selectedIndicatorDetails = React.useMemo(
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

    const indicatorOptions = React.useMemo(
        () => {
            if (!indicatorListResponse?.results) {
                return undefined;
            }
            const options = [
                ...indicatorListResponse?.results,
            ];
            options.push({ id: -1, fullTitle: 'Age group', abstract: undefined });
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
                mapState={mapState}
                mapPaint={mapPaint}
            >
                {showHealthResource && (
                    <TravelTimeLayer
                        onHospitalClick={handleHospitalClick}
                        selectedHospitals={selectedHospitals}
                        travelTimeShown={showHealthTravelTime}
                    />
                )}
            </IndicatorMap>
            <Stats className={styles.stats} />
            <div className={styles.mapStyleConfigContainer}>
                <RegionSelector searchHidden />
                <ToggleButton
                    label="Show health facilities"
                    value={showHealthResource}
                    onChange={setShowHealthResource}
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
                                    <FiX />
                                )}
                            >
                                {hospital}
                            </Button>
                        ))}
                    </div>
                )}
                <ToggleButton
                    disabled={!showHealthResource}
                    label="Show travel time"
                    value={showHealthTravelTime}
                    onChange={setShowHealthTravelTime}
                />
                {showHealthResource && showHealthTravelTime && (
                    <ChoroplethLegend
                        className={styles.legend}
                        minValue=""
                        opacity={0.6}
                        legend={{
                            [fourHourColor]: '4hrs',
                            [eightHourColor]: '8hrs',
                            [twelveHourColor]: '12hrs',
                            // [uncoveredColor]: 'Uncovered',
                        }}
                        zeroPrecision={selectedIndicator === -1}
                    />
                )}
                <div className={styles.layerSelection}>
                    <SegmentInput
                        options={attributeOptions}
                        onChange={setAttribute}
                        value={selectedAttribute}
                        optionLabelSelector={attributeLabelSelector}
                        optionKeySelector={attributeKeySelector}
                    />
                    {selectedAttribute === 'fiveW' && (
                        <>
                            <SelectInput
                                label="Selected attribute"
                                className={styles.fiveWSegmentInput}
                                options={fiveWOptions}
                                onChange={setFiveWOption}
                                value={selectedFiveWOption}
                                optionLabelSelector={fiveWLabelSelector}
                                optionKeySelector={fiveWKeySelector}
                            />
                            <ChoroplethLegend
                                className={styles.legend}
                                minValue={dataMinValue}
                                legend={mapLegend}
                            />
                        </>
                    )}
                    {selectedAttribute === 'indicator' && (
                        <>
                            <SelectInput
                                placeholder="Select an indicator"
                                className={styles.indicatorSelectInput}
                                disabled={indicatorListPending}
                                options={indicatorOptions}
                                onChange={setSelectedIndicator}
                                value={selectedIndicator}
                                optionLabelSelector={indicatorLabelSelector}
                                optionKeySelector={indicatorKeySelector}
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
                            <ChoroplethLegend
                                className={styles.legend}
                                minValue={dataMinValue}
                                legend={mapLegend}
                                zeroPrecision={selectedIndicator === -1}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Covid19;
