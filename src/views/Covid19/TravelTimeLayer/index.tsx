import React, { useCallback } from 'react';

import MapSource from '#remap/MapSource';
import MapLayer from '#remap/MapSource/MapLayer';
import MapTooltip from '#remap/MapTooltip';

import TextOutput from '#components/TextOutput';

import { Season, HospitalType } from '../types';

import theme, { visibleLayout, noneLayout } from './mapTheme';

// const uncoveredColor = '#455a64';
// const uncoveredDarkColor = '#1c313a';

const noOp = () => {};

export interface DesignatedHospital {
    name: string;
    category__name: string;
    type__name: string;
    contact_num: string;
}

const tooltipOptions: mapboxgl.PopupOptions = {
    closeOnClick: false,
    closeButton: false,
    offset: 8,
    maxWidth: '480px',
};

interface Props {
    selectedHospitals: string[];
    onHospitalClick: (feature: mapboxgl.MapboxGeoJSONFeature) => boolean;
    travelTimeShown?: boolean;

    prefix?: string;
    season?: Season['key'];
    hospitalType?: HospitalType['key'];
}

function TravelTimeLayer(props: Props) {
    const {
        selectedHospitals,
        onHospitalClick,

        travelTimeShown,
        prefix,

        hospitalType,
        season,
    } = props;

    type SelectedHospital = GeoJSON.Feature<GeoJSON.Point, DesignatedHospital>;
    const [
        designatedHospitalProperties,
        setDesignatedHospitalProperties,
    ] = React.useState<{ lngLat: mapboxgl.LngLatLike; feature: SelectedHospital }>();

    const handleDesignatedHospitalTooltipOpen = useCallback(
        (
            feature: mapboxgl.MapboxGeoJSONFeature,
            lngLat: mapboxgl.LngLat,
        ) => {
            setDesignatedHospitalProperties({
                lngLat,
                feature: feature as unknown as SelectedHospital,
            });
            return true;
        },
        [],
    );

    const handleDesignatedHospitalTooltipHide = () => {
        setDesignatedHospitalProperties(undefined);
    };

    const hospitalSourceLayer = (
        (hospitalType === 'deshosp' && 'coviddesignatedhospitalsgeo')
        || (hospitalType === 'allcovidhfs' && 'covidhospitalsgeo')
        || 'allhospitalsgeo'
    );

    const catchmentUrl = (
        (hospitalType === 'deshosp' && season === 'dry' && 'mapbox://togglecorp.265cfnxb')
        || (hospitalType === 'deshosp' && season === 'msn' && 'mapbox://togglecorp.1blomcjm')
        || (hospitalType === 'allcovidhfs' && season === 'dry' && 'mapbox://togglecorp.0s4o7p46')
        || (hospitalType === 'allcovidhfs' && season === 'msn' && 'mapbox://togglecorp.b26l1lz5')
        || undefined
    );

    const catchmentFilter = selectedHospitals.length <= 0
        ? undefined
        : ['in', ['get', 'name'], ['literal', selectedHospitals]];
    const catchmentLayout = travelTimeShown
        ? visibleLayout
        : noneLayout;

    return (
        <>
            {catchmentUrl && (
                <MapSource
                    sourceKey={`${prefix}-travel-time`}
                    sourceOptions={{
                        type: 'vector',
                        url: catchmentUrl,
                    }}
                >
                    <MapLayer
                        layerKey="twelvehour-fill"
                        layerOptions={{
                            type: 'fill',
                            'source-layer': 'twelvehourgeo',
                            paint: theme.catchment.twelvehour.fillPaint,
                            filter: catchmentFilter,
                            layout: catchmentLayout,
                        }}
                        onMouseEnter={noOp}
                    />
                    <MapLayer
                        layerKey="eighthour-fill"
                        layerOptions={{
                            type: 'fill',
                            'source-layer': 'eighthourgeo',
                            paint: theme.catchment.eighthour.fillPaint,
                            filter: catchmentFilter,
                            layout: catchmentLayout,
                        }}
                        onMouseEnter={noOp}
                    />
                    <MapLayer
                        layerKey="fourhour-fill"
                        layerOptions={{
                            type: 'fill',
                            'source-layer': 'fourhourgeo',
                            paint: theme.catchment.fourhour.fillPaint,
                            filter: catchmentFilter,
                            layout: catchmentLayout,
                        }}
                        onMouseEnter={noOp}
                    />

                    <MapLayer
                        layerKey="twelvehour-line"
                        layerOptions={{
                            type: 'line',
                            'source-layer': 'twelvehourgeo',
                            paint: theme.catchment.twelvehour.linePaint,
                            filter: catchmentFilter,
                            layout: catchmentLayout,
                        }}
                    />
                    <MapLayer
                        layerKey="eighthour-line"
                        layerOptions={{
                            type: 'line',
                            'source-layer': 'eighthourgeo',
                            paint: theme.catchment.eighthour.linePaint,
                            filter: catchmentFilter,
                            layout: catchmentLayout,
                        }}
                    />
                    <MapLayer
                        layerKey="fourhour-line"
                        layerOptions={{
                            type: 'line',
                            'source-layer': 'fourhourgeo',
                            paint: theme.catchment.fourhour.linePaint,
                            filter: catchmentFilter,
                            layout: catchmentLayout,
                        }}
                    />
                    {/*
                    <MapLayer
                        layerKey="uncovered-fill"
                        layerOptions={{
                            type: 'fill',
                            'source-layer': 'uncoveredgeo',
                            paint: {
                                'fill-color': uncoveredColor,
                                'fill-opacity': 0.4,
                            },
                            layout: travelTimeShow && selectedHospitals.length <= 0
                                ? { visibility: 'visible' }
                                : { visibility: 'none' },
                        }}
                        onMouseEnter={noOp}
                    />
                    */}
                    {/*
                    <MapLayer
                        layerKey="uncovered-line"
                        layerOptions={{
                            type: 'line',
                            'source-layer': 'uncoveredgeo',
                            paint: {
                                'line-width': 2,
                                'line-color': uncoveredDarkColor,
                                'line-opacity': [
                                    'case',
                                    ['==', ['feature-state', 'hovered'], true],
                                    1,
                                    0,
                                ],
                            },
                            layout: travelTimeShow && selectedHospitals.length <= 0
                                ? { visibility: 'visible' }
                                : { visibility: 'none' },
                        }}
                    />
                    */}
                </MapSource>
            )}
            <MapSource
                sourceKey={`${prefix}-hospitals`}
                sourceOptions={{
                    type: 'vector',
                    url: 'mapbox://togglecorp.7sfpl5br',
                }}
            >
                <MapLayer
                    layerKey="hospital-circle"
                    layerOptions={{
                        type: 'circle',
                        'source-layer': hospitalSourceLayer,
                        // FIXME: memoize this
                        paint: theme.hospital.circlePaint(selectedHospitals),
                    }}
                    onMouseEnter={handleDesignatedHospitalTooltipOpen}
                    onMouseLeave={handleDesignatedHospitalTooltipHide}
                    onClick={onHospitalClick}
                />
                <MapLayer
                    layerKey="hospital-symbol"
                    layerOptions={{
                        type: 'symbol',
                        'source-layer': hospitalSourceLayer,
                        paint: theme.hospital.symbolPaint,
                        layout: theme.hospital.symbolLayout,
                    }}
                />
                {designatedHospitalProperties && (
                    <MapTooltip
                        coordinates={designatedHospitalProperties.lngLat}
                        tooltipOptions={tooltipOptions}
                        trackPointer
                    >
                        <>
                            <h3>
                                {designatedHospitalProperties.feature.properties.name}
                            </h3>
                            <TextOutput
                                label="Category"
                                // eslint-disable-next-line max-len
                                value={designatedHospitalProperties.feature.properties.category__name}
                            />
                            <TextOutput
                                label="Type"
                                // eslint-disable-next-line max-len
                                value={designatedHospitalProperties.feature.properties.type__name}
                            />
                            <TextOutput
                                label="Contact"
                                // eslint-disable-next-line max-len
                                value={designatedHospitalProperties.feature.properties.contact_num}
                            />
                        </>
                    </MapTooltip>
                )}
            </MapSource>
        </>
    );
}
export default TravelTimeLayer;
