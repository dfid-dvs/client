import React from 'react';
/*
interface HealthResource {
    id: number;
    title: string;
    description: string | null;
    ward: number;
    point: {
        type: 'Point';
        coordinates: [number, number];
    };

    long: number;
    lat: number;
}
*/

import MapLayer from '#remap/MapSource/MapLayer';
import MapState from '#remap/MapSource/MapState';

interface Props {
    onMouseLeave?: () => void;
    onMouseEnter?: (
        feature: mapboxgl.MapboxGeoJSONFeature,
        lnglat: mapboxgl.LngLat,
        point: mapboxgl.Point,
    ) => void;
    onClick?: (
        feature: mapboxgl.MapboxGeoJSONFeature,
        lnglat: mapboxgl.LngLat,
        point: mapboxgl.Point,
    ) => boolean | undefined;
    // FIXME: use type from typings
    mapState: { id: number; value: number }[];
    mapPaint: mapboxgl.FillPaint;
}

function MunicipalityLayer(props: Props) {
    const {
        onMouseEnter,
        onMouseLeave,
        onClick,
        mapState,
        mapPaint,
    } = props;

    return (
        <>
            <MapLayer
                layerKey="palika-fill"
                layerOptions={{
                    type: 'fill',
                    'source-layer': 'palikageo',
                    paint: mapPaint,
                }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={onClick}
            />
            <MapLayer
                layerKey="palika-line"
                layerOptions={{
                    type: 'line',
                    'source-layer': 'palikageo',
                    paint: {
                        'line-color': '#000000',
                        'line-width': 1,
                        'line-opacity': [
                            'case',
                            ['==', ['feature-state', 'hovered'], true],
                            0.8,
                            0.1,
                        ],
                    },
                }}
            />
            <MapState
                attributes={mapState}
                attributeKey="value"
                sourceLayer="palikageo"
            />
        </>
    );
}

export default MunicipalityLayer;
