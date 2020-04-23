import React, { useCallback } from 'react';
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

import IndicatorMap from '#components/IndicatorMap';
import Stats from './Stats';

import useRequest from '#hooks/useRequest';
import useMapStateForIndicator from '#hooks/useMapStateForIndicator';

import { AgeGroupOption, MultiResponse } from '#types';

import { generateChoroplethMapPaintAndLegend } from '#utils/common';
import {
    colorDomain,
    tooltipOptions,
    apiEndPoint,
} from '#utils/constants';

import styles from './styles.css';

// FIXME: use from typings
interface MapState {
    id: number;
    value: number;
}

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

interface TextOutputProps {
    label: string | number;
    value: React.ReactNode | null;
}

function TextOutput({
    label,
    value,
}: TextOutputProps) {
    return (
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
}

interface NaxaHealthResource {
    id: number;
    ownership_display: string;
    district_name: string;
    province_name: string;
    municipality_name: string;
    category_name: string;
    type_name: string;
    distance: number;
    name: string;
    ownership: string;
    contact_person: string;
    contact_num: string;
    used_for_corona_response: boolean;
    num_of_bed: number;
    num_of_icu_bed: number;
    occupied_icu_bed: number;
    num_of_ventilators: number;
    occupied_ventilators: number;
    num_of_isolation_bed: number;
    occupied_isolation_bed: number;
    total_tested: number;
    total_positive: number;
    total_death: number;
    total_in_isolation: number;
    hlcit_code: string;
    remarks: string;
    location: string;
    lat: number;
    long: number;
    province: number;
    district: number;
    municipality: number;
    category: number;
    type: number;
}

interface NepwareHealthResource {
    id: number;
    title: string;
    description: string | null;
    point: GeoJSON.Point;
    bedCount: number | null;
    type: string;
    cbsCode: number;
    phoneNumber: string | null;
    emailAddress: string | null;
    emergencyService: string | null;
    icu: string | number | null;
    nicu: string | number | null;
    operatingTheater: boolean | string | number | null;
    xRay: boolean | string | number | null;
    ambulanceService: boolean | string | number | null;
    openingHours: string | null;
    operatorType: string;
    noOfStaffs: number | null;
    noOfBeds: number | null;
    specialization: string | number | null;
    ward: number;
    resourceType: string;
}

type TrimmedNaxaHealthResource = Omit<NaxaHealthResource, 'long' | 'lat'>;
type TrimmedNepwareHealthResource = Omit<NepwareHealthResource, 'point'>;

interface TooltipProps {
    feature: GeoJSON.Feature<GeoJSON.Point, TrimmedNepwareHealthResource>;
}
const Tooltip = ({ feature }: TooltipProps) => {
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

interface CovidReadyToolTipProps {
    feature: GeoJSON.Feature<GeoJSON.Point, TrimmedNaxaHealthResource>;
}
function CovidReadyTooltip({ feature }: CovidReadyToolTipProps) {
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
}

interface HoveredPoint {
    feature: mapboxgl.MapboxGeoJSONFeature;
    lngLat: mapboxgl.LngLatLike;
}

type HealthResourcePointsProps = {
    covidReady: true;
    sourceKey: string;
    data: GeoJSON.FeatureCollection<GeoJSON.Point, TrimmedNaxaHealthResource>;
} | {
    covidReady: false;
    sourceKey: string;
    data: GeoJSON.FeatureCollection<GeoJSON.Point, TrimmedNepwareHealthResource>;
};
function HealthResourcePoints(props: HealthResourcePointsProps) {
    const {
        covidReady,
        data: healthResourcePointCollection,
        sourceKey,
    } = props;

    // eslint-disable-next-line max-len
    type HoveredFeature = GeoJSON.Feature<GeoJSON.Point, TrimmedNaxaHealthResource | TrimmedNepwareHealthResource>;

    const [
        hoveredPointProperties,
        setHoveredPointProperties,
    ] = React.useState<{ lngLat: mapboxgl.LngLatLike; feature: HoveredFeature }>();

    const handleMouseEnter = useCallback(
        (
            hoveredFeature: mapboxgl.MapboxGeoJSONFeature,
            lngLat: mapboxgl.LngLatLike,
        ) => {
            const feature = hoveredFeature as unknown as HoveredFeature;
            setHoveredPointProperties({ feature, lngLat });
        },
        [],
    );

    const handleMouseLeave = useCallback(
        () => {
            setHoveredPointProperties(undefined);
        },
        [],
    );

    return (
        <MapSource
            sourceKey={`${sourceKey}-health-resource-points`}
            sourceOptions={{
                type: 'geojson',
                cluster: true,
                clusterRadius: 20,
                clusterMaxZoom: 10,
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
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
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
            {hoveredPointProperties && (
                <MapTooltip
                    coordinates={hoveredPointProperties.lngLat}
                    tooltipOptions={tooltipOptions}
                    trackPointer
                >
                    { covidReady ? (
                        <CovidReadyTooltip
                            feature={
                                hoveredPointProperties.feature as
                                GeoJSON.Feature<GeoJSON.Point, TrimmedNaxaHealthResource>
                            }
                        />
                    ) : (
                        <Tooltip
                            feature={
                                hoveredPointProperties.feature as
                                GeoJSON.Feature<GeoJSON.Point, TrimmedNepwareHealthResource>
                            }
                        />
                    )}
                </MapTooltip>
            )}
        </MapSource>
    );
}

interface Props {
    className?: string;
}

function Covid19(props: Props) {
    const { className } = props;
    const { regionLevel } = React.useContext(NavbarContext);

    const [
        selectedIndicator,
        setSelectedIndicator,
    ] = React.useState<number | undefined>();

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

    const indicatorListGetUrl = `${apiEndPoint}/indicator-list/?is_covid=1`;
    const [
        indicatorListPending,
        indicatorListResponse,
    ] = useRequest<MultiResponse<Indicator>>(indicatorListGetUrl);

    const covidReadyHealthResourcesUrl = showHealthResource && showCovidReadyHealthResourceOnly
        ? 'https://covidapi.naxa.com.np/api/v1/health-facility2/'
        : undefined;
    const [
        covidReadyHealthResourceListPending,
        covidReadyHealthResourceList,
    ] = useRequest<MultiResponse<NaxaHealthResource>>(covidReadyHealthResourcesUrl);

    const healthResourcesUrl = showHealthResource && !showCovidReadyHealthResourceOnly
        ? 'https://bipad.staging.nepware.com/api/v1/resource/?resource_type=health&meta=true&limit=-1'
        : undefined;
    const [
        healthResourceListPending,
        healthResourceList,
    ] = useRequest<MultiResponse<NepwareHealthResource>>(healthResourcesUrl);

    const covidReadyHealthResourcePointCollection = React.useMemo(() => {
        const geojson: GeoJSON.FeatureCollection<GeoJSON.Point, TrimmedNaxaHealthResource> = {
            type: 'FeatureCollection',
            features: !covidReadyHealthResourceList
                ? []
                : covidReadyHealthResourceList.results.map((h) => {
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
        const geojson: GeoJSON.FeatureCollection<GeoJSON.Point, TrimmedNepwareHealthResource> = {
            type: 'FeatureCollection',
            features: !healthResourceList
                ? []
                : healthResourceList.results.map((h) => {
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
        [mapStateForIndicator],
    );

    const pending = mapStateForIndicatorPending
        || indicatorListPending
        || covidReadyHealthResourceListPending
        || healthResourceListPending;

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
            ) */}
            <IndicatorMap
                className={styles.mapContainer}
                regionLevel={regionLevel}
                mapState={mapStateForIndicator}
                mapPaint={mapPaint}
            >
                {showHealthResource && showCovidReadyHealthResourceOnly && (
                    <HealthResourcePoints
                        covidReady
                        sourceKey={`covid-ready-${regionLevel}`}
                        data={covidReadyHealthResourcePointCollection}
                    />
                )}
                {showHealthResource && !showCovidReadyHealthResourceOnly && (
                    <HealthResourcePoints
                        covidReady={false}
                        sourceKey={`all-${regionLevel}`}
                        data={healthResourcePointCollection}
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
                <ToggleButton
                    disabled={!showHealthResource}
                    label="Show COVID ready health facilities only"
                    value={showCovidReadyHealthResourceOnly}
                    onChange={setShowCovidReadyHealthResourceOnly}
                />
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
                        optionLabelSelector={indicatorLabelSelector}
                        optionKeySelector={indicatorKeySelector}
                    />
                    { selectedIndicatorDetails && selectedIndicatorDetails.abstract && (
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
                    { Object.keys(mapLegend).length > 0 && (
                        <ChoroplethLegend
                            className={styles.legend}
                            minValue={dataMinValue}
                            legend={mapLegend}
                            zeroPrecision={selectedIndicator === -1}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Covid19;