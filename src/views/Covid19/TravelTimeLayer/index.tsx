import React, { useCallback } from 'react';

import MapSource from '#remap/MapSource';
import MapLayer from '#remap/MapSource/MapLayer';
import MapTooltip from '#remap/MapTooltip';

import TextOutput from '#components/TextOutput';

export const fourHourColor = 'green';
export const fourHourDarkColor = '#387002';

export const eightHourColor = 'yellow';
export const eightHourDarkColor = '#c67100';

export const twelveHourColor = 'red';
export const twelveHourDarkColor = '#9a0007';

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
}

function TravelTimeLayer(props: Props) {
    const {
        selectedHospitals,
        onHospitalClick,

        travelTimeShown,
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

    return (
        <>
            <MapSource
                sourceKey="dry-designated-hospitals"
                sourceOptions={{
                    type: 'vector',
                    url: 'mapbox://togglecorp.1scxncx4',
                }}
            >
                <MapLayer
                    layerKey="twelvehour-fill"
                    layerOptions={{
                        type: 'fill',
                        'source-layer': 'twelvehourgeo',
                        paint: {
                            'fill-color': twelveHourColor,
                            'fill-opacity': 0.4,
                        },
                        filter: selectedHospitals.length <= 0
                            ? undefined
                            : ['in', ['get', 'name'], ['literal', selectedHospitals]],
                        layout: travelTimeShown
                            ? { visibility: 'visible' }
                            : { visibility: 'none' },
                    }}
                    onMouseEnter={noOp}
                />
                <MapLayer
                    layerKey="eighthour-fill"
                    layerOptions={{
                        type: 'fill',
                        'source-layer': 'eighthourgeo',
                        paint: {
                            'fill-color': eightHourColor,
                            'fill-opacity': 0.4,
                        },
                        filter: selectedHospitals.length <= 0
                            ? undefined
                            : ['in', ['get', 'name'], ['literal', selectedHospitals]],
                        layout: travelTimeShown
                            ? { visibility: 'visible' }
                            : { visibility: 'none' },
                    }}
                    onMouseEnter={noOp}
                />
                <MapLayer
                    layerKey="fourhour-fill"
                    layerOptions={{
                        type: 'fill',
                        'source-layer': 'fourhourgeo',
                        paint: {
                            'fill-color': fourHourColor,
                            'fill-opacity': 0.4,
                        },
                        filter: selectedHospitals.length <= 0
                            ? undefined
                            : ['in', ['get', 'name'], ['literal', selectedHospitals]],
                        layout: travelTimeShown
                            ? { visibility: 'visible' }
                            : { visibility: 'none' },
                    }}
                    onMouseEnter={noOp}
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

                <MapLayer
                    layerKey="twelvehour-line"
                    layerOptions={{
                        type: 'line',
                        'source-layer': 'twelvehourgeo',
                        paint: {
                            'line-width': 2,
                            'line-color': twelveHourDarkColor,
                            'line-opacity': [
                                'case',
                                ['==', ['feature-state', 'hovered'], true],
                                1,
                                0,
                            ],
                        },
                        filter: selectedHospitals.length <= 0
                            ? undefined
                            : ['in', ['get', 'name'], ['literal', selectedHospitals]],
                    }}
                />
                <MapLayer
                    layerKey="eighthour-line"
                    layerOptions={{
                        type: 'line',
                        'source-layer': 'eighthourgeo',
                        paint: {
                            'line-width': 2,
                            'line-color': eightHourDarkColor,
                            'line-opacity': [
                                'case',
                                ['==', ['feature-state', 'hovered'], true],
                                1,
                                0,
                            ],
                        },
                        filter: selectedHospitals.length <= 0
                            ? undefined
                            : ['in', ['get', 'name'], ['literal', selectedHospitals]],
                    }}
                />
                <MapLayer
                    layerKey="fourhour-line"
                    layerOptions={{
                        type: 'line',
                        'source-layer': 'fourhourgeo',
                        paint: {
                            'line-width': 2,
                            'line-color': fourHourDarkColor,
                            'line-opacity': [
                                'case',
                                ['==', ['feature-state', 'hovered'], true],
                                1,
                                0,
                            ],
                        },
                        filter: selectedHospitals.length <= 0
                            ? undefined
                            : ['in', ['get', 'name'], ['literal', selectedHospitals]],
                    }}
                />
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
            <MapSource
                sourceKey="hospitals"
                sourceOptions={{
                    type: 'vector',
                    url: 'mapbox://togglecorp.7sfpl5br',
                }}
            >
                <MapLayer
                    layerKey="covid-designated-hospitals-circle"
                    layerOptions={{
                        type: 'circle',
                        'source-layer': 'coviddesignatedhospitalsgeo',
                        paint: {
                            'circle-radius': 9,
                            'circle-color': '#fff',
                            'circle-stroke-color': '#a72828',
                            'circle-stroke-width': [
                                'case',
                                ['in', ['get', 'name'], ['literal', selectedHospitals]],
                                2,
                                0,
                            ],
                            'circle-opacity': [
                                'case',
                                ['in', ['get', 'name'], ['literal', selectedHospitals]],
                                0.9,
                                0.7,
                            ],
                        },
                    }}
                    onMouseEnter={handleDesignatedHospitalTooltipOpen}
                    onMouseLeave={handleDesignatedHospitalTooltipHide}
                    onClick={onHospitalClick}
                />
                <MapLayer
                    layerKey="covid-designated-hospitals-symbol"
                    layerOptions={{
                        type: 'symbol',
                        'source-layer': 'coviddesignatedhospitalsgeo',
                        paint: {
                            'icon-color': '#a72828',
                        },
                        layout: {
                            'icon-image': 'hospital-11',
                            'icon-allow-overlap': true,
                        },
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
