import React from 'react';

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

function DistrictLayer(props: Props) {
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
                layerKey="district-fill"
                layerOptions={{
                    type: 'fill',
                    'source-layer': 'districtgeo',
                    paint: mapPaint,
                }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={onClick}
            />
            <MapLayer
                layerKey="district-line"
                layerOptions={{
                    type: 'line',
                    'source-layer': 'districtgeo',
                    paint: {
                        'line-color': '#000000',
                        'line-width': 1,
                        'line-opacity': [
                            'case',
                            ['==', ['feature-state', 'hovered'], true],
                            0.8,
                            0.2,
                        ],
                    },
                }}
            />
            <MapState
                attributes={mapState}
                attributeKey="value"
                sourceLayer="districtgeo"
            />
        </>
    );
}

export default DistrictLayer;
