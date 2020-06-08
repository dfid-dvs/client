import React, { useMemo } from 'react';

import MapSource from '#remap/MapSource';
import MapTooltip from '#remap/MapTooltip';
import MapLayer from '#remap/MapSource/MapLayer';

import TextOutput from '#components/TextOutput';
import Numeral from '#components/Numeral';

import { getVectorTile } from '#utils/common';
import { VectorLayer, Layer } from '#types';

interface HoveredRegion {
    feature: mapboxgl.MapboxGeoJSONFeature;
    lngLat: mapboxgl.LngLatLike;
}

interface TooltipProps {
    feature?: mapboxgl.MapboxGeoJSONFeature;
    popupInfo: VectorLayer['popupInfo'];
}
function Tooltip({
    feature,
    popupInfo,
}: TooltipProps) {
    if (!feature) {
        return null;
    }

    return (
        <div>
            {popupInfo.map(info => (
                <TextOutput
                    label={info.title}
                    value={
                        info.type === 'number'
                            ? (<Numeral value={feature.properties?.[info.key]} />)
                            : feature.properties?.[info.key]
                    }
                />
            ))}
        </div>
    );
}

const tooltipOptions: mapboxgl.PopupOptions = {
    closeOnClick: false,
    closeButton: false,
    offset: 8,
    maxWidth: '480px',
};

// NOTE: just don't propagate click below
const handleVectorLayerClick = () => true;

interface VectorMapLayerProps {
    layer: VectorLayer;
}

function VectorMapLayer(props: VectorMapLayerProps) {
    const { layer } = props;

    const {
        geoserverUrl,
        workspace,
        layerName,

        geoType,
        style,
        popupInfo,
    } = layer;

    const tiles = useMemo(
        () => ([
            getVectorTile(
                geoserverUrl,
                workspace,
                layerName,
            ),
        ]),
        [geoserverUrl, workspace, layerName],
    );

    const [
        hoveredRegionProperties,
        setHoveredRegionProperties,
    ] = React.useState<HoveredRegion | undefined>();

    const handleMapRegionMouseEnter = React.useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            setHoveredRegionProperties({
                feature,
                lngLat,
            });
        },
        [setHoveredRegionProperties],
    );

    const handleMapRegionMouseLeave = React.useCallback(
        () => {
            setHoveredRegionProperties(undefined);
        },
        [setHoveredRegionProperties],
    );

    const layerOptions: Omit<mapboxgl.Layer, 'id'> | undefined = useMemo(
        () => {
            const myStyle = style[0];
            if (!myStyle) {
                return undefined;
            }
            if (geoType === 'point') {
                return {
                    type: 'circle',
                    'source-layer': layerName,
                    paint: {
                        'circle-color': myStyle.circleColor,
                        'circle-radius': myStyle.circleRadius,
                        'circle-opacity': 0.4,

                        'circle-stroke-color': 'black',
                        'circle-stroke-opacity': 0.7,
                        'circle-stroke-width': [
                            'case',
                            ['==', ['feature-state', 'hovered'], true],
                            2,
                            0,
                        ],
                    },
                };
            }
            return {
                type: 'fill',
                'source-layer': layerName,
                paint: {
                    'fill-color': myStyle.fillColor,
                    'fill-opacity': 0.5,
                },
            };
        },
        [layerName, geoType, style],
    );

    if (!layerOptions) {
        return null;
    }

    return (
        <MapSource
            key={layerName}
            sourceKey="testtest"
            sourceOptions={{
                type: 'vector',
                tiles,
            }}
        >
            <MapLayer
                layerKey="vector-layer"
                layerOptions={layerOptions}
                onMouseEnter={handleMapRegionMouseEnter}
                onMouseLeave={handleMapRegionMouseLeave}
                onClick={handleVectorLayerClick}
            />
            { hoveredRegionProperties && hoveredRegionProperties.lngLat && (
                <MapTooltip
                    coordinates={hoveredRegionProperties.lngLat}
                    tooltipOptions={tooltipOptions}
                    trackPointer
                >
                    <Tooltip
                        feature={hoveredRegionProperties.feature}
                        popupInfo={popupInfo}
                    />
                </MapTooltip>
            )}
        </MapSource>
    );
}

export default VectorMapLayer;
