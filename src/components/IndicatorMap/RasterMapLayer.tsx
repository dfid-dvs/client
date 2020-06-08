import React, { useMemo } from 'react';

import MapSource from '#remap/MapSource';
import MapLayer from '#remap/MapSource/MapLayer';
import { getLayerName } from '#remap/utils';

import { getRasterTile } from '#utils/common';
import { RasterLayer } from '#types';

import theme from './mapTheme';

interface RasterMapLayerProps {
    layer: RasterLayer;
}
function RasterMapLayer(props: RasterMapLayerProps) {
    const { layer } = props;

    const tiles = useMemo(
        () => ([
            getRasterTile(
                layer.geoserverUrl,
                layer.workspace,
                layer.layerName,
            ),
        ]),
        [layer],
    );

    return (
        <MapSource
            key={layer.layerName}
            sourceKey={layer.layerName}
            sourceOptions={{
                type: 'raster',
                tiles,
                tileSize: 256,
            }}
        >
            <MapLayer
                layerKey="raster-layer"
                beneath={getLayerName('nepal', 'palika-fill')}
                layerOptions={{
                    type: 'raster',
                    paint: theme.background.rasterPaint,
                }}
            />
        </MapSource>
    );
}
export default RasterMapLayer;
