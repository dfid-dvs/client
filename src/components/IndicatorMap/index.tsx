import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import Map from '#remap';
import MapBounds from '#remap/MapBounds';
import MapContainer from '#remap/MapContainer';
import MapSource from '#remap/MapSource';
import MapTooltip from '#remap/MapTooltip';
import MapLayer from '#remap/MapSource/MapLayer';
import MapState from '#remap/MapSource/MapState';
import { getLayerName } from '#remap/utils';

import {
    getRasterTile,
} from '#utils/common';

import { Layer, MapStateItem } from '#types';

import theme, { noneLayout, visibleLayout } from './mapTheme';

import styles from './styles.css';


const defaultCenter: mapboxgl.LngLatLike = [
    84.1240, 28.3949,
];

const defaultBounds: [number, number, number, number] = [
    80.05858661752784, 26.347836996368667,
    88.20166918432409, 30.44702867091792,
];

const mapOptions: Omit<mapboxgl.MapboxOptions, 'style' | 'container'> = {
    logoPosition: 'bottom-right',
    minZoom: 5,
    zoom: 3,
    center: defaultCenter,
    bounds: defaultBounds,
};

const tooltipOptions: mapboxgl.PopupOptions = {
    closeOnClick: false,
    closeButton: false,
    offset: 8,
    maxWidth: '480px',
};

interface HoveredRegion {
    feature: mapboxgl.MapboxGeoJSONFeature;
    lngLat: mapboxgl.LngLatLike;
}

const Tooltip = ({
    feature,
}: { feature: mapboxgl.MapboxGeoJSONFeature }) => {
    if (!feature) {
        return null;
    }

    return (
        <div className={styles.tooltip}>
            {feature.properties && (
                <div className={styles.regionTitle}>
                    { feature.properties.name }
                </div>
            )}
            {feature.state && (
                <div className={styles.value}>
                    { feature.state.value }
                </div>
            )}
        </div>
    );
};

interface Props {
    className?: string;
    regionLevel: 'municipality' | 'district' | 'province';
    // FIXME: use type from typings
    choroplethMapState?: MapStateItem[];
    bubbleMapState?: MapStateItem[];
    choroplethMapPaint?: mapboxgl.FillPaint;
    bubbleMapPaint?: mapboxgl.CirclePaint;
    children?: React.ReactNode;
    hideChoropleth?: boolean;
    hideBubble?: boolean;
    rasterLayer?: Layer;
    printMode?: boolean;
    hideTooltipOnHover?: boolean;
    onClick?: (
        feature: mapboxgl.MapboxGeoJSONFeature,
        lngLat: mapboxgl.LngLat,
        point: mapboxgl.Point,
    ) => boolean | undefined;
}

function IndicatorMap(props: Props) {
    const {
        className,
        regionLevel,
        choroplethMapState,
        bubbleMapState,
        choroplethMapPaint,
        bubbleMapPaint,
        children,
        hideChoropleth,
        hideBubble,
        rasterLayer,
        printMode,
        hideTooltipOnHover,
        onClick,
    } = props;

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

    const handleMapRegionMouseLeave = React.useCallback(() => {
        setHoveredRegionProperties(undefined);
    }, [setHoveredRegionProperties]);

    const rasterTiles = useMemo(
        () => {
            if (!rasterLayer) {
                return undefined;
            }
            return [getRasterTile(
                rasterLayer.geoserverUrl,
                rasterLayer.workspace,
                rasterLayer.layerName,
            )];
        },
        [rasterLayer],
    );

    const isProvinceVisible = regionLevel === 'province';
    const isDistrictVisible = regionLevel === 'district';
    const isMunicipalityVisible = regionLevel === 'municipality';

    let selectedSourceForChoropleth;
    let selectedSourceForBubble;

    if (regionLevel === 'province') {
        selectedSourceForChoropleth = 'provincegeo';
        selectedSourceForBubble = 'provincecentroidgeo';
    } else if (regionLevel === 'district') {
        selectedSourceForChoropleth = 'districtgeo';
        selectedSourceForBubble = 'districtcentroidgeo';
    } else if (regionLevel === 'municipality') {
        selectedSourceForChoropleth = 'palikageo';
        selectedSourceForBubble = 'palikacentroidgeo';
    }

    return (
        <Map
            mapStyle="mapbox://styles/togglecorp/ck9jjmob30vio1it71wja5zhi"
            mapOptions={mapOptions}
            scaleControlShown
            scaleControlPosition="bottom-right"
            navControlShown={!printMode}
            navControlPosition="bottom-right"
        >
            <MapContainer className={_cs(styles.mapContainer, className)} />
            <MapBounds
                bounds={defaultBounds}
                padding={100}
            />
            <MapSource
                sourceKey="nepal"
                sourceOptions={{
                    type: 'vector',
                    url: 'mapbox://togglecorp.2p8uqg5e',
                }}
            >
                <MapLayer
                    layerKey="palika-fill"
                    layerOptions={{
                        type: 'fill',
                        'source-layer': 'palikageo',
                        paint: choroplethMapPaint,
                        layout: (isMunicipalityVisible && !hideChoropleth)
                            ? visibleLayout : noneLayout,
                    }}
                    onMouseEnter={handleMapRegionMouseEnter}
                    onMouseLeave={handleMapRegionMouseLeave}
                    onClick={onClick}
                />
                <MapLayer
                    layerKey="district-fill"
                    layerOptions={{
                        type: 'fill',
                        'source-layer': 'districtgeo',
                        paint: choroplethMapPaint,
                        layout: (isDistrictVisible && !hideChoropleth) ? visibleLayout : noneLayout,
                    }}
                    onMouseEnter={handleMapRegionMouseEnter}
                    onMouseLeave={handleMapRegionMouseLeave}
                    onClick={onClick}
                />
                <MapLayer
                    layerKey="province-fill"
                    layerOptions={{
                        type: 'fill',
                        'source-layer': 'provincegeo',
                        paint: choroplethMapPaint,
                        layout: (isProvinceVisible && !hideChoropleth) ? visibleLayout : noneLayout,
                    }}
                    onMouseEnter={handleMapRegionMouseEnter}
                    onMouseLeave={handleMapRegionMouseLeave}
                    onClick={onClick}
                />
                <MapLayer
                    layerKey="province-line"
                    layerOptions={{
                        type: 'line',
                        'source-layer': 'provincegeo',
                        paint: theme.province.outlinePaint,
                        layout: isProvinceVisible || isDistrictVisible
                            ? visibleLayout
                            : noneLayout,
                    }}
                />
                <MapLayer
                    layerKey="district-line"
                    layerOptions={{
                        type: 'line',
                        'source-layer': 'districtgeo',
                        paint: theme.district.outlinePaint,
                        layout: isDistrictVisible || isMunicipalityVisible
                            ? visibleLayout
                            : noneLayout,
                    }}
                />
                <MapLayer
                    layerKey="palika-line"
                    layerOptions={{
                        type: 'line',
                        'source-layer': 'palikageo',
                        paint: theme.municipality.outlinePaint,
                        layout: isMunicipalityVisible
                            ? visibleLayout
                            : noneLayout,
                    }}
                />
                <MapState
                    key={selectedSourceForChoropleth}
                    attributes={choroplethMapState}
                    attributeKey="value"
                    sourceLayer={selectedSourceForChoropleth}
                />
                {!hideTooltipOnHover
                    && hoveredRegionProperties
                    && hoveredRegionProperties.lngLat && (
                    <MapTooltip
                        coordinates={hoveredRegionProperties.lngLat}
                        tooltipOptions={tooltipOptions}
                        trackPointer
                    >
                        <Tooltip
                            feature={hoveredRegionProperties.feature}
                        />
                    </MapTooltip>
                )}
            </MapSource>
            <MapSource
                sourceKey="nepal-centroids"
                sourceOptions={{
                    type: 'vector',
                    url: 'mapbox://togglecorp.4eqzulj8',
                }}
            >
                <MapLayer
                    layerKey="municipality-bubble"
                    layerOptions={{
                        type: 'circle',
                        'source-layer': 'palikacentroidgeo',
                        paint: bubbleMapPaint,
                        layout: (isMunicipalityVisible && !hideBubble) ? visibleLayout : noneLayout,
                    }}
                />
                <MapLayer
                    layerKey="district-bubble"
                    layerOptions={{
                        type: 'circle',
                        'source-layer': 'districtcentroidgeo',
                        paint: bubbleMapPaint,
                        layout: (isDistrictVisible && !hideBubble) ? visibleLayout : noneLayout,
                    }}
                />
                <MapLayer
                    layerKey="province-bubble"
                    layerOptions={{
                        type: 'circle',
                        'source-layer': 'provincecentroidgeo',
                        paint: bubbleMapPaint,
                        layout: (isProvinceVisible && !hideBubble) ? visibleLayout : noneLayout,
                    }}
                />
                {/*
                <MapLayer
                    layerKey="palika-label"
                    layerOptions={{
                        type: 'symbol',
                        'source-layer': 'palikacentroidgeo',
                        paint: theme.municipality.labelPaint,
                        layout: isMunicipalityVisible ? theme.municipality.labelLayout : noneLayout,
                    }}
                />
                <MapLayer
                    layerKey="district-label"
                    layerOptions={{
                        type: 'symbol',
                        'source-layer': 'districtcentroidgeo',
                        paint: theme.district.labelPaint,
                        layout: isDistrictVisible ? theme.district.labelLayout : noneLayout,
                    }}
                />
                <MapLayer
                    layerKey="province-label"
                    layerOptions={{
                        type: 'symbol',
                        'source-layer': 'provincecentroidgeo',
                        paint: theme.province.labelPaint,
                        layout: isProvinceVisible ? theme.province.labelLayout : noneLayout,
                    }}
                />
                */}
                {rasterLayer && (
                    <MapSource
                        key={rasterLayer.layerName}
                        sourceKey={rasterLayer.layerName}
                        sourceOptions={{
                            type: 'raster',
                            tiles: rasterTiles,
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
                )}
                <MapState
                    key={selectedSourceForBubble}
                    attributes={bubbleMapState}
                    attributeKey="value"
                    sourceLayer={selectedSourceForBubble}
                />
            </MapSource>
            { children }
        </Map>
    );
}

export default IndicatorMap;
