import React, { useContext, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import Map from '#remap';
import DomainContext from '#components/DomainContext';
import MapContainer from '#remap/MapContainer';
import MapSource from '#remap/MapSource';
import MapLayer from '#remap/MapSource/MapLayer';
import MapBounds from '#remap/MapBounds';

import {
    Bbox,
} from '#types';

import styles from './styles.css';

const defaultCenter: mapboxgl.LngLatLike = [
    84.1240, 28.3949,
];

const defaultBounds: [number, number, number, number] = [
    80.05858661752784, 26.347836996368667,
    88.20166918432409, 30.44702867091792,
];

const mapOptions: Omit<mapboxgl.MapboxOptions, 'style' | 'container'> = {
    logoPosition: 'bottom-left',
    minZoom: 5,
    zoom: 3,
    center: defaultCenter,
    bounds: defaultBounds,
    // interactive: false,
};

const outlinePaint: mapboxgl.LinePaint = {
    'line-color': '#000000',
    'line-width': 0.1,
};

const fillPaint: mapboxgl.FillPaint = {
    'fill-color': '#05367d',
    'fill-opacity': 0.3,
};

const labelPaint: mapboxgl.SymbolPaint = {
    'text-color': '#6b6b6b',
    'text-halo-color': 'rgba(255, 255, 255, 1)',
    'text-halo-width': 1,
    'text-halo-blur': 0,
};

const labelLayout: mapboxgl.SymbolLayout = {
    visibility: 'visible',
    'text-font': ['Source Sans Pro SemiBold', 'Arial Unicode MS Regular'],
    'text-field': ['get', 'name'],
    'text-size': 10,
    // 'text-transform': 'uppercase',
    'text-justify': 'center',
    'text-anchor': 'center',
    'text-padding': 0,
};

interface Props {
    className?: string;
    bounds?: Bbox;
    mapRegions: number[];
}

function InfographicsMap(props: Props) {
    const {
        className,
        bounds,
        mapRegions,
    } = props;
    const { regionLevel } = useContext(DomainContext);
    const filter = useMemo(() => ['in', ['id'], ['literal', mapRegions]], [mapRegions]);

    return (
        <Map
            mapStyle="mapbox://styles/togglecorp/ck9av67fu0i441ipd23xm7o0w"
            mapOptions={mapOptions}
            scaleControlShown={false}
            navControlShown={false}
        >
            <MapContainer className={_cs(className, styles.mapContainer)} />
            <MapSource
                sourceKey="nepal-centroid"
                sourceOptions={{
                    type: 'vector',
                    url: 'mapbox://togglecorp.4eqzulj8',
                }}
            >
                { regionLevel === 'province' && (
                    <MapLayer
                        layerKey="province-label"
                        layerOptions={{
                            type: 'symbol',
                            // TODO: Use centroid source layer
                            'source-layer': 'provincecentroidgeo',
                            paint: labelPaint,
                            layout: labelLayout,
                            filter,
                        }}
                    />
                )}
                { regionLevel === 'district' && (
                    <MapLayer
                        layerKey="district-label"
                        layerOptions={{
                            type: 'symbol',
                            'source-layer': 'districtcentroidgeo',
                            paint: labelPaint,
                            layout: labelLayout,
                            filter,
                        }}
                    />
                )}
                { regionLevel === 'municipality' && (
                    <MapLayer
                        layerKey="municipality-label"
                        layerOptions={{
                            type: 'symbol',
                            'source-layer': 'palikacentroidgeo',
                            paint: labelPaint,
                            layout: labelLayout,
                            filter,
                        }}
                    />
                )}
            </MapSource>
            <MapSource
                sourceKey="nepal"
                sourceOptions={{
                    type: 'vector',
                    url: 'mapbox://togglecorp.2p8uqg5e',
                }}
            >
                { regionLevel === 'province' && (
                    <>
                        <MapLayer
                            layerKey="province-fill"
                            layerOptions={{
                                type: 'fill',
                                'source-layer': 'provincegeo',
                                paint: fillPaint,
                                filter,
                            }}
                        />
                        <MapLayer
                            layerKey="province-line"
                            layerOptions={{
                                type: 'line',
                                'source-layer': 'provincegeo',
                                paint: outlinePaint,
                            }}
                        />
                    </>
                )}
                { regionLevel === 'district' && (
                    <>
                        <MapLayer
                            layerKey="district-fill"
                            layerOptions={{
                                type: 'fill',
                                'source-layer': 'districtgeo',
                                paint: fillPaint,
                                filter,
                            }}
                        />
                        <MapLayer
                            layerKey="district-line"
                            layerOptions={{
                                type: 'line',
                                'source-layer': 'districtgeo',
                                paint: outlinePaint,
                            }}
                        />
                    </>
                )}
                { regionLevel === 'municipality' && (
                    <>
                        <MapLayer
                            layerKey="municipality-fill"
                            layerOptions={{
                                type: 'fill',
                                'source-layer': 'palikageo',
                                paint: fillPaint,
                                filter,
                            }}
                        />
                        <MapLayer
                            layerKey="municipality-line"
                            layerOptions={{
                                type: 'line',
                                'source-layer': 'palikageo',
                                paint: outlinePaint,
                            }}
                        />
                    </>
                )}
            </MapSource>
            <MapBounds
                bounds={bounds || defaultBounds}
                padding={10}
            />
        </Map>
    );
}

export default InfographicsMap;
