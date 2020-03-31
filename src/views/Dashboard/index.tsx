import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import Map from '#remap';
import MapContainer from '#remap/MapContainer';
import MapSource from '#remap/MapSource';
import MapLayer from '#remap/MapSource/MapLayer';

import { useRequest } from '#hooks';
import NavbarContext from '#components/NavbarContext';
import {
    RegionLevelOption,
} from '#types';


import styles from './styles.css';

const defaultCenter: [number, number] = [84.1240, 28.3949];

const defaultBounds: [number, number, number, number] = [
    80.05858661752784, 26.347836996368667,
    88.20166918432409, 30.44702867091792,
];

const palikaTiles = ['http://139.59.67.104:8060/api/v1/core/palika-tile/{z}/{x}/{y}'];
const districtTiles = ['http://139.59.67.104:8060/api/v1/core/district-tile/{z}/{x}/{y}'];
const provinceTiles = ['http://139.59.67.104:8060/api/v1/core/province-tile/{z}/{x}/{y}'];

const tiles: {
    [key in RegionLevelOption]: string[];
} = {
    municipality: palikaTiles,
    district: districtTiles,
    province: provinceTiles,
};

interface Props {
    className?: string;
}

const requestOption = {
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
    },
};

const mapOptions = {
    logoPosition: 'top-left',
    minZoom: 5,
    zoom: 3,
    center: defaultCenter,
    bounds: defaultBounds,
};

const Dashboard = (props: Props) => {
    const { className } = props;

    const { regionLevel } = React.useContext(NavbarContext);
    const [pending, response] = useRequest('http://139.59.67.104:8060/api/v1/core/indicator-list/', requestOption);
    const onClick = useCallback(
        (name: string) => {
            console.warn('Button clicked', name);
        },
        [],
    );

    const sourceOptions = {
        type: 'vector',
        tiles: tiles[regionLevel],
    };

    const layerOptions = {
        type: 'line',
        'source-layer': 'default',
        layout: {
            'line-cap': 'round',
            'line-join': 'round',
        },
        paint: {
            'line-opacity': 0.6,
            'line-color': 'red',
            'line-width': 1,
        },
    };

    console.warn('source options', regionLevel, sourceOptions);

    return (
        <div className={_cs(
            styles.dashboard,
            className,
        )}
        >
            <Map
                mapStyle="mapbox://styles/mapbox/light-v10"
                mapOptions={mapOptions}
                scaleControlShown
                scaleControlPosition="bottom-right"
                navControlShown
                navControlPosition="bottom-right"
            >
                <MapContainer className={styles.mapContainer} />
                <MapSource
                    sourceKey={regionLevel}
                    sourceOptions={sourceOptions}
                >
                    <MapLayer
                        layerKey="line"
                        layerOptions={layerOptions}
                    />
                </MapSource>
            </Map>
            <div className={styles.indicators}>
                { pending ? 'Loading...' : (
                    response.results.map(indicator => (
                        <div key={indicator.id}>{ indicator.fullTitle }</div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
