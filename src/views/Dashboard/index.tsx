import React from 'react';
import {
    createConnectedRequestCoordinator,
} from '#request';

import Map from '../../vendor/re-map';
import MapBounds from '../../vendor/re-map/MapBounds';
import MapContainer from '../../vendor/re-map/MapContainer';
import MapSource from '../../vendor/re-map/MapSource';
import MapLayer from '../../vendor/re-map/MapSource/MapLayer';

import Sidebar from '#components/Sidebar';

import styles from './styles.scss';

interface State {
}
interface Props {}

const bounds: [number, number, number, number] = [
    80.05858661752784, 26.347836996368667,
    88.20166918432409, 30.44702867091792,
];
const mapOptions = {
    zoomLevel: 3,
    center: [84.1240, 28.3949],
    bounds,
};

class Dashboard extends React.PureComponent<Props, State> {
    public render() {
        return (
            <div className={styles.dashboard}>
                <Sidebar className={styles.sidebar} />
                <div className={styles.mainContent}>
                    <Map
                        mapStyle={process.env.REACT_APP_MAPBOX_STYLE}
                        mapOptions={mapOptions}
                        scaleControlShown
                        navControlShown
                    >
                        <MapBounds
                            bounds={mapOptions.bounds}
                            padding={50}
                        />
                        <MapSource
                            sourceKey="nepal"
                            sourceOptions={{
                                type: 'vector',
                                url: 'mapbox://adityakhatri.colcm1cq',
                            }}
                        >
                            <MapLayer
                                layerKey="municipality"
                                layerOptions={{
                                    'source-layer': 'municipalitygeo',
                                    type: 'line',
                                    paint: {
                                        'line-color': '#aaaaaa',
                                        'line-width': 0.5,
                                    },
                                }}
                            />
                            <MapLayer
                                layerKey="district"
                                layerOptions={{
                                    'source-layer': 'districtgeo',
                                    type: 'line',
                                    paint: {
                                        'line-color': '#57b3a9',
                                        'line-width': 2,
                                    },
                                }}
                            />
                            <MapLayer
                                layerKey="province"
                                layerOptions={{
                                    'source-layer': 'provincegeo',
                                    type: 'line',
                                    paint: {
                                        'line-color': '#00665d',
                                        'line-width': 3,
                                    },
                                }}
                            />
                        </MapSource>
                        <MapContainer
                            className={styles.map}
                        />
                    </Map>
                </div>
            </div>
        );
    }
}

export default createConnectedRequestCoordinator<Props>()(
    Dashboard,
);
