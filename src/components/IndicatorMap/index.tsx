import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Map from '#remap';
import MapBounds from '#remap/MapBounds';
import MapContainer from '#remap/MapContainer';
import MapSource from '#remap/MapSource';
import MapLayer from '#remap/MapSource/MapLayer';
import MapState from '#remap/MapSource/MapState';

import { VectorLayer, RasterLayer, MapStateItem } from '#types';

import theme, { noneLayout, visibleLayout } from './mapTheme';
import RasterMapLayer from './RasterMapLayer';
import VectorMapLayer from './VectorMapLayer';

import styles from './styles.css';


const defaultCenter: mapboxgl.LngLatLike = [
    84.1240, 28.3949,
];

const defaultBounds: [number, number, number, number] = [
    80.05858661752784, 26.347836996368667,
    88.20166918432409, 30.44702867091792,
];

const leftSpacedPadding = {
    top: 20,
    bottom: 20,
    right: 20,
    left: 320 + 20,
};
const defaultPadding = 20;

const mapOptions: Omit<mapboxgl.MapboxOptions, 'style' | 'container'> = {
    logoPosition: 'bottom-right',
    minZoom: 5,
    zoom: 3,
    center: defaultCenter,
    bounds: defaultBounds,
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
    rasterLayer?: RasterLayer;
    vectorLayers?: VectorLayer[];
    printMode?: boolean;
    // hideTooltipOnHover?: boolean;
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
        vectorLayers,
        printMode,
        // hideTooltipOnHover,
        onClick,
    } = props;

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
            scaleControlPosition="top-right"
            navControlShown={!printMode}
            navControlPosition="top-right"
        >
            <MapContainer className={_cs(styles.mapContainer, className)} />
            <MapBounds
                bounds={defaultBounds}
                padding={printMode ? defaultPadding : leftSpacedPadding}
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
                <MapState
                    key={selectedSourceForBubble}
                    attributes={bubbleMapState}
                    attributeKey="value"
                    sourceLayer={selectedSourceForBubble}
                />
            </MapSource>
            {rasterLayer && (
                <RasterMapLayer
                    layer={rasterLayer}
                />
            )}
            {vectorLayers?.filter(vectorLayer => vectorLayer.geoType === 'point').map(vectorLayer => (
                <VectorMapLayer
                    layer={vectorLayer}
                    key={vectorLayer.id}
                />
            ))}
            { children }
        </Map>
    );
}

export default IndicatorMap;
