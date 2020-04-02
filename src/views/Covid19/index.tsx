import React from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import { GoLinkExternal } from 'react-icons/go';

import MapSource from '#remap/MapSource';
import MapLayer from '#remap/MapSource/MapLayer';
import MapTooltip from '#remap/MapTooltip';

import NavbarContext from '#components/NavbarContext';
import SelectInput from '#components/SelectInput';
import ChoroplethLegend from '#components/ChoroplethLegend';
import Backdrop from '#components/Backdrop';
import LoadingAnimation from '#components/LoadingAnimation';

import IndicatorMap from '#components/IndicatorMap';

import {
    useRequest,
    useMapState,
} from '#hooks';

import { generateChoroplethMapPaintAndLegend } from '#utils/common';
import {
    colorDomain,
    tooltipOptions,
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

const StatOutput = ({
    label,
    value,
}) => (
    <div className={styles.statOutput}>
        <div className={styles.value}>
            { value }
        </div>
        <div className={styles.label}>
            { label }
        </div>
    </div>
);

const ExternalLink = ({
    link,
    label,
}) => (
    <a
        href={link}
        className={styles.externalLink}
        target="_blank"
        rel="noopener noreferrer"
    >
        <GoLinkExternal className={styles.icon} />
        <div className={styles.label}>
            { label }
        </div>
    </a>
);

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

const Covid19 = (props: Props) => {
    const { className } = props;
    const { regionLevel } = React.useContext(NavbarContext);

    const [
        selectedIndicator,
        setSelectedIndicator,
    ] = React.useState<number | undefined>(undefined);

    const indicatorListGetUrl = 'http://139.59.67.104:8060/api/v1/core/indicator-list/?is_covid=1';
    const [
        indicatorListPending,
        indicatorListResponse,
    ] = useRequest<Indicator>(indicatorListGetUrl);

    const [
        statusPending,
        status,
    ] = useRequest('https://nepalcorona.info/api/v1/data/nepal');

    const [
        hospitalListPending,
        hospitalList,
    ] = useRequest<HealthResource>('http://bipad.staging.nepware.com/api/v1/resource/?resource_type=health&meta=true&limit=-1');

    const hospitalPointCollection = React.useMemo(() => {
        const geojson = {
            type: 'FeatureCollection',
            features: hospitalList.results.map((h) => {
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
    }, [hospitalList]);

    const [mapStatePending, mapState] = useMapState(regionLevel, selectedIndicator);
    const [hoveredPointProperties, setHoveredPointProperties] = React.useState({});

    const {
        paint: mapPaint,
        legend: mapLegend,
        min: dataMinValue,
    } = React.useMemo(
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

    const pending = mapStatePending || indicatorListPending || statusPending || hospitalListPending;

    const selectedIndicatorDetails = React.useMemo(() => {
        if (selectedIndicator) {
            return indicatorListResponse.results.find(
                d => String(d.id) === String(selectedIndicator),
            );
        }

        return undefined;
    }, [selectedIndicator, indicatorListResponse]);

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
                mapState={mapState}
                mapPaint={mapPaint}
                hideTooltip={!!hoveredPointProperties.lngLat}
            >
                <MapSource
                    sourceKey="hospitals-point"
                    sourceOptions={{
                        type: 'geojson',
                        cluster: true,
                    }}
                    geoJson={hospitalPointCollection}
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
                            <Tooltip feature={hoveredPointProperties.feature} />
                        </MapTooltip>
                    )}
                </MapSource>

            </IndicatorMap>
            <div className={styles.statusContainer}>
                <h4 className={styles.heading}>
                    Overall status
                </h4>
                {status && (
                    <>
                        <div className={styles.content}>
                            <StatOutput
                                label="Tests performed"
                                value={status.tested_total}
                            />
                            <StatOutput
                                label="Tested positive"
                                value={status.tested_positive}
                            />
                            <StatOutput
                                label="Tested negative"
                                value={status.tested_negative}
                            />
                            <StatOutput
                                label="In isolation"
                                value={status.in_isolation}
                            />
                            <StatOutput
                                label="Deaths"
                                value={status.deaths}
                            />
                        </div>
                        <div className={styles.footer}>
                            <ExternalLink
                                link={status.source}
                                label="Source"
                            />
                            <ExternalLink
                                link={status.latest_sit_report
                                    ? status.latest_sit_report.url
                                    : undefined
                                }
                                label="Latest situation report"
                            />
                        </div>
                    </>
                )}
            </div>
            <div className={styles.mapStyleConfigContainer}>
                <h4 className={styles.heading}>
                    Indicator
                </h4>
                <SelectInput
                    className={styles.indicatorSelectInput}
                    disabled={indicatorListPending}
                    options={indicatorListResponse.results}
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
                { Object.keys(mapLegend).length > 0 && (
                    <ChoroplethLegend
                        className={styles.legend}
                        minValue={dataMinValue}
                        legend={mapLegend}
                    />
                )}
            </div>
        </div>
    );
};

export default Covid19;
