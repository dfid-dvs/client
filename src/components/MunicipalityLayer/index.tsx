import React from 'react';

import MapLayer from '#remap/MapSource/MapLayer';
import MapState from '#remap/MapSource/MapState';

interface Props {
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
