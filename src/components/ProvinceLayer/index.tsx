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
    visible?: boolean;
    // FIXME: use type from typings
    mapState: { id: number; value: number }[];
    mapPaint: mapboxgl.FillPaint;
}

function ProvinceLayer(props: Props) {
    const {
        onMouseEnter,
        onMouseLeave,
        onClick,
        mapState,
        mapPaint,
        visible,
    } = props;

    return (
        <>
            <MapLayer
                layerKey="province-fill"
                layerOptions={{
                    type: 'fill',
                    'source-layer': 'provincegeo',
                    paint: mapPaint,
                    layout: visible
                        ? { visibility: 'visible' }
                        : { visibility: 'none' },
                }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={onClick}
            />
            <MapLayer
                layerKey="province-line"
                layerOptions={{
                    type: 'line',
                    'source-layer': 'provincegeo',
                    paint: {
                        'line-color': '#000000',
                        'line-width': 1,
                        'line-opacity': [
                            'case',
                            ['==', ['feature-state', 'hovered'], true],
                            1,
                            0.3,
                        ],
                    },
                    layout: visible
                        ? { visibility: 'visible' }
                        : { visibility: 'none' },
                }}
            />
            <MapState
                attributes={mapState}
                attributeKey="value"
                sourceLayer="provincegeo"
            />
        </>
    );
}

export default ProvinceLayer;
