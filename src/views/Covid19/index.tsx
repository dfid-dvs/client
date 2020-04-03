import React from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';


import MapSource from '#remap/MapSource';
import MapLayer from '#remap/MapSource/MapLayer';
import MapTooltip from '#remap/MapTooltip';

import SegmentInput from '#components/SegmentInput';
import NavbarContext from '#components/NavbarContext';
import SelectInput from '#components/SelectInput';
import ChoroplethLegend from '#components/ChoroplethLegend';
import Backdrop from '#components/Backdrop';
import LoadingAnimation from '#components/LoadingAnimation';
import ToggleButton from '#components/ToggleButton';
import Checkbox from '#components/Checkbox';

import IndicatorMap from '#components/IndicatorMap';
import Stats from './Stats';

import {
    useRequest,
    useMapStateForIndicator,
} from '#hooks';

import { AgeGroupOption } from '#types';

import { generateChoroplethMapPaintAndLegend } from '#utils/common';
import {
    colorDomain,
    tooltipOptions,
    apiEndPoint,
} from '#utils/constants';

import styles from './styles.css';

interface MapState {
    id: number;
    value: number;
}

interface Indicator {
    id: number;
    fullTitle: string;
}

interface Props {
    className?: string;
}

type ShowLayerOption = 'indicator' | 'ageGroup';
interface LayerOption {
    key: ShowLayerOption;
    label: string;
}

const showLayerByOptions: LayerOption[] = [
    { key: 'indicator', label: 'Indicator' },
    { key: 'ageGroup', label: 'Age group' },
];

interface HealthResource {
    id: number;
    title: string;
    description: string | null;
    ward: number;
    point: {
        type: 'Point';
        coordinates: [number, number];
    };
}

interface AgeGroup {
    key: AgeGroupOption;
    label: string;
}

const ageGroupOptions: AgeGroup[] = [
    { key: 'belowFourteen', label: 'Below 14' },
    { key: 'fifteenToFourtyNine', label: '15 to 49' },
    { key: 'aboveFifty', label: 'Above 50' },
];

const TextOutput = ({
    label,
    value,
}) => (
    <div className={styles.textOutput}>
        <div className={styles.label}>
            { label }
        </div>
        { isDefined(value) && value !== 'null' ? (
            <div className={styles.value}>
                { value }
            </div>
        ) : (
            <div className={styles.nullValue}>
                Information not available
            </div>
        )}
    </div>
);

const Tooltip = ({ feature }) => {
    const {
        ambulanceService,
        bedCount,
        cbsCode,
        description,
        emailAddress,
        emergencyService,
        icu,
        id,
        nicu,
        noOfBeds,
        noOfStaffs,
        openingHours,
        operatingTheater,
        operatorType,
        phoneNumber,
        resourceType,
        specialization,
        title,
        type,
        ward,
        xRay,
    } = feature.properties;

    return (
        <div className={styles.tooltip}>
            <div className={styles.title}>
                { title }
            </div>
            <TextOutput
                label="Ambulance service"
                value={ambulanceService}
            />
            <TextOutput
                label="Bed count"
                value={bedCount}
            />
            <TextOutput
                label="CBS Code"
                value={cbsCode}
            />
            <TextOutput
                label="Email"
                value={emailAddress}
            />
            <TextOutput
                label="Emergency service"
                value={emergencyService}
            />
            <TextOutput
                label="ICU"
                value={icu}
            />
            <TextOutput
                label="NICU"
                value={nicu}
            />
            <TextOutput
                label="Number of staffs"
                value={noOfStaffs}
            />
            <TextOutput
                label="Opening hours"
                value={openingHours}
            />
            <TextOutput
                label="Operator type"
                value={operatorType}
            />
            <TextOutput
                label="Phone number"
                value={phoneNumber}
            />
            <TextOutput
                label="Specialization"
                value={specialization}
            />
            <TextOutput
                label="Type"
                value={type}
            />
            <TextOutput
                label="X-Ray"
                value={xRay}
            />
        </div>
    );
};

const CovidReadyTooltip = ({ feature }) => {
    const {
        // eslint-disable-next-line @typescript-eslint/camelcase
        ownership_display,
        // eslint-disable-next-line @typescript-eslint/camelcase
        category_name,
        // eslint-disable-next-line @typescript-eslint/camelcase
        type_name,
        name,
        // eslint-disable-next-line @typescript-eslint/camelcase
        contact_num,
        // eslint-disable-next-line @typescript-eslint/camelcase
        used_for_corona_response,
    } = feature.properties;

    return (
        <div className={styles.tooltip}>
            <div className={styles.title}>
                { name }
            </div>
            <TextOutput
                label="Category"
                // eslint-disable-next-line @typescript-eslint/camelcase
                value={category_name}
            />
            <TextOutput
                label="Ownership type"
                // eslint-disable-next-line @typescript-eslint/camelcase
                value={ownership_display}
            />
            <TextOutput
                label="Type"
                // eslint-disable-next-line @typescript-eslint/camelcase
                value={type_name}
            />
            <TextOutput
                label="Used for COVID-19"
                // eslint-disable-next-line @typescript-eslint/camelcase
                value={used_for_corona_response ? 'Yes' : 'No'}
            />
            <TextOutput
                label="Contact number"
                // eslint-disable-next-line @typescript-eslint/camelcase
                value={contact_num}
            />
        </div>
    );
};

function HealthResourcePoints(props) {
    const {
        covidReady,
        data: healthResourcePointCollection,
        sourceKey,
    } = props;
    const [hoveredPointProperties, setHoveredPointProperties] = React.useState({});

    return (
        <MapSource
            sourceKey={`${sourceKey}-health-resource-points`}
            sourceOptions={{
                type: 'geojson',
                cluster: true,
            }}
            geoJson={healthResourcePointCollection}
        >
            <MapLayer
                layerKey="cluster"
                layerOptions={{
                    type: 'circle',
                    paint: {
                        'circle-color': '#ff8484',
                        'circle-opacity': 0.7,
                        'circle-radius': [
                            'interpolate',
                            ['linear'],
                            ['get', 'point_count'],
                            2,
                            12,
                            100,
                            30,
                        ],
                    },
                    filter: ['has', 'point_count'],
                }}
            />
            <MapLayer
                layerKey="cluster-count"
                layerOptions={{
                    type: 'symbol',
                    filter: ['has', 'point_count'],
                    layout: {
                        'text-field': '{point_count_abbreviated}',
                        'text-size': 12,
                    },
                }}
            />
            <MapLayer
                layerKey="circle-fill"
                layerOptions={{
                    type: 'circle',
                    paint: {
                        'circle-radius': 9,
                        'circle-color': '#fff',
                        'circle-stroke-color': '#a72828',
                        'circle-stroke-width': 2,
                        'circle-opacity': 0.9,
                    },
                    filter: ['!', ['has', 'point_count']],
                }}
                onMouseEnter={(feature, lngLat) => {
                    setHoveredPointProperties({ feature, lngLat });
                }}
                onMouseLeave={() => {
                    setHoveredPointProperties({
                        feature: undefined,
                        lngLat: undefined,
                    });
                }}
            />
            <MapLayer
                layerKey="hospital-symbol"
                layerOptions={{
                    type: 'symbol',
                    paint: {
                        'icon-color': 'red',
                    },
                    layout: {
                        'icon-image': 'hospital-11',
                        'icon-allow-overlap': true,
                    },
                    filter: ['!', ['has', 'point_count']],
                }}
            />
            {hoveredPointProperties.lngLat && (
                <MapTooltip
                    coordinates={hoveredPointProperties.lngLat}
                    tooltipOptions={tooltipOptions}
                    trackPointer
                >
                    { covidReady ? (
                        <CovidReadyTooltip feature={hoveredPointProperties.feature} />
                    ) : (
                        <Tooltip feature={hoveredPointProperties.feature} />
                    )}
                </MapTooltip>
            )}
        </MapSource>
    );
}

const Covid19 = (props: Props) => {
    const { className } = props;
    const { regionLevel } = React.useContext(NavbarContext);

    const [
        selectedIndicator,
        setSelectedIndicator,
    ] = React.useState<number | undefined>(undefined);

    const [
        selectedAgeGroup,
        setSelectedAgeGroup,
    ] = React.useState<AgeGroupOption>('belowFourteen');

    const [
        showHealthResource,
        setShowHealthResource,
    ] = React.useState<boolean>(false);

    const [
        showCovidReadyHealthResourceOnly,
        setShowCovidReadyHealthResourceOnly,
    ] = React.useState<boolean>(true);

    const [
        showLayerBy,
        setShowLayerBy,
    ] = React.useState<ShowLayerOption>('indicator');

    const indicatorListGetUrl = `${apiEndPoint}/indicator-list/?is_covid=1`;
    const [
        indicatorListPending,
        indicatorListResponse,
    ] = useRequest<Indicator>(indicatorListGetUrl);

    const covidReadyHealthResourcesUrl = showHealthResource && showCovidReadyHealthResourceOnly
        ? 'https://covidapi.naxa.com.np/api/v1/health-facility/'
        : undefined;
    const [
        covidReadyHealthResourceListPending,
        covidReadyHealthResourceList,
    ] = useRequest<HealthResource>(covidReadyHealthResourcesUrl);

    const healthResourcesUrl = showHealthResource && !showCovidReadyHealthResourceOnly
        ? 'https://bipad.staging.nepware.com/api/v1/resource/?resource_type=health&meta=true&limit=-1'
        : undefined;
    const [
        healthResourceListPending,
        healthResourceList,
    ] = useRequest<HealthResource>(healthResourcesUrl);

    const covidReadyHealthResourcePointCollection = React.useMemo(() => {
        const geojson = {
            type: 'FeatureCollection',
            features: covidReadyHealthResourceList.results.map((h) => {
                const {
                    lat,
                    long,
                    ...otherProperties
                } = h;

                return {
                    id: h.id,
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [long, lat],
                    },
                    properties: { ...otherProperties },
                };
            }),
        };

        return geojson;
    }, [covidReadyHealthResourceList]);

    const healthResourcePointCollection = React.useMemo(() => {
        const geojson = {
            type: 'FeatureCollection',
            features: healthResourceList.results.map((h) => {
                const {
                    point,
                    ...otherProperties
                } = h;

                return {
                    id: h.id,
                    type: 'Feature',
                    geometry: { ...point },
                    properties: { ...otherProperties },
                };
            }),
        };

        return geojson;
    }, [healthResourceList]);

    const [
        mapStateForIndicatorPending,
        mapStateForIndicator,
    ] = useMapStateForIndicator(regionLevel, selectedIndicator, selectedAgeGroup);


    const {
        paint: mapPaint,
        legend: mapLegend,
        min: dataMinValue,
    } = React.useMemo(
        () => {
            const valueList = mapStateForIndicator.map(d => d.value);
            const min = Math.min(...valueList);
            const max = Math.max(...valueList);

            return {
                min,
                ...generateChoroplethMapPaintAndLegend(colorDomain, min, max),
            };
        },
        [showLayerBy, mapStateForIndicator],
    );

    const pending = mapStateForIndicatorPending
        || indicatorListPending
        || covidReadyHealthResourceListPending
        || healthResourceListPending;

    const selectedIndicatorDetails = React.useMemo(() => {
        if (selectedIndicator) {
            return indicatorListResponse.results.find(
                d => String(d.id) === String(selectedIndicator),
            );
        }

        return undefined;
    }, [selectedIndicator, indicatorListResponse]);

    const indicatorOptions = React.useMemo(() => {
        const options = [
            ...indicatorListResponse.results,
        ];
        options.push({ id: -1, fullTitle: 'Age group' });
        return options;
    }, [indicatorListResponse]);

    return (
        <div className={_cs(
            styles.covid19,
            className,
        )}
        >
            { pending && (
                <Backdrop className={styles.backdrop}>
                    <LoadingAnimation />
                </Backdrop>
            )}
            <IndicatorMap
                className={styles.mapContainer}
                regionLevel={regionLevel}
                mapState={mapStateForIndicator}
                mapPaint={mapPaint}
            >
                { showHealthResource && (
                    <HealthResourcePoints
                        covidReady={showCovidReadyHealthResourceOnly}
                        sourceKey={regionLevel}
                        data={showCovidReadyHealthResourceOnly
                            ? covidReadyHealthResourcePointCollection
                            : healthResourcePointCollection
                        }
                    />
                )}
            </IndicatorMap>
            <Stats className={styles.stats} />
            <div className={styles.mapStyleConfigContainer}>
                <ToggleButton
                    label="Show health facilities"
                    value={showHealthResource}
                    onChange={setShowHealthResource}
                />
                { showHealthResource && (
                    <ToggleButton
                        label="Show COVID ready health facilities only"
                        value={showCovidReadyHealthResourceOnly}
                        onChange={setShowCovidReadyHealthResourceOnly}
                    />
                )}
                <div className={styles.layerSelection}>
                    <h4 className={styles.heading}>
                        Indicator
                    </h4>
                    <SelectInput
                        placeholder="Select an indicator"
                        className={styles.indicatorSelectInput}
                        disabled={indicatorListPending}
                        options={indicatorOptions}
                        onChange={setSelectedIndicator}
                        value={selectedIndicator}
                        optionLabelSelector={d => d.fullTitle}
                        optionKeySelector={d => d.id}
                    />
                    { selectedIndicatorDetails && (
                        <div className={styles.abstract}>
                            { selectedIndicatorDetails.abstract }
                        </div>
                    )}
                    { String(selectedIndicator) === '-1' && (
                        <SegmentInput
                            label="Selected range"
                            className={styles.ageGroupSelectInput}
                            options={ageGroupOptions}
                            onChange={setSelectedAgeGroup}
                            value={selectedAgeGroup}
                            optionLabelSelector={d => d.label}
                            optionKeySelector={d => d.key}
                        />
                    )}
                    { Object.keys(mapLegend).length > 0 && (
                        <ChoroplethLegend
                            className={styles.legend}
                            minValue={dataMinValue}
                            legend={mapLegend}
                            zeroPrecision={String(selectedIndicator) === '-1'}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Covid19;
