import React from 'react';

import MapLayer from '#remap/MapSource/MapLayer';
import MapState from '#remap/MapSource/MapState';

interface Props {
}

function ProvinceLayer(props: Props) {
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
                layerKey="province-fill"
                layerOptions={{
                    type: 'fill',
                    'source-layer': 'provincegeo',
                    paint: mapPaint,
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
