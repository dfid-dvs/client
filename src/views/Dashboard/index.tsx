import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import Map from '#remap';
import MapContainer from '#remap/MapContainer';
import MapSource from '#remap/MapSource';
import MapLayer from '#remap/MapSource/MapLayer';

import Button from '#components/Button';

import styles from './styles.css';

const defaultCenter: [number, number] = [84.1240, 28.3949];

const defaultBounds: [number, number, number, number] = [
    80.05858661752784, 26.347836996368667,
    88.20166918432409, 30.44702867091792,
];

const palikaTiles = ['http://139.59.67.104:8060/api/v1/core/palika-tile/{z}/{x}/{y}'];

interface Props {
    className?: string;
}

const Dashboard = (props: Props) => {
    const { className } = props;

    const onClick = useCallback(
        (name: string) => {
            console.warn('Button clicked', name);
        },
        [],
    );

    return (
        <div className={_cs(
            styles.dashboard,
            className,
        )}
        >
            <Map
                mapStyle="mapbox://styles/mapbox/light-v10"
                mapOptions={{
                    logoPosition: 'top-left',
                    minZoom: 5,

                    zoom: 3,
                    center: defaultCenter,
                    bounds: defaultBounds,
                }}
                scaleControlShown
                scaleControlPosition="bottom-right"

                navControlShown
                navControlPosition="bottom-right"
            >
                <MapContainer
                    className={styles.mapContainer}
                />
                <MapSource
                    sourceKey="palika"
                    sourceOptions={{
                        type: 'vector',
                        tiles: palikaTiles,
                    }}
                >
                    <MapLayer
                        layerKey="palika-line"
                        layerOptions={{
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
                        }}
                    />
                </MapSource>

            </Map>
            <div className={styles.buttons}>
                <Button
                    className={styles.button}
                    onClick={onClick}
                    name="default"
                >
                    default
                </Button>
                <Button
                    variant="primary"
                    pending
                    className={styles.button}
                    onClick={onClick}
                    name="primary"
                >
                    primary
                </Button>
                <Button
                    variant="accent"
                    className={styles.button}
                    onClick={onClick}
                    name="accent"
                >
                    accent
                </Button>
                <Button
                    variant="warning"
                    className={styles.button}
                    onClick={onClick}
                    name="warning"
                >
                    warning
                </Button>
                <Button
                    variant="danger"
                    className={styles.button}
                    onClick={onClick}
                    name="danger"
                >
                    danger
                </Button>
                <Button
                    variant="success"
                    className={styles.button}
                    onClick={onClick}
                    name="success"
                >
                    success
                </Button>
            </div>
            <div className={styles.buttons}>
                <Button
                    className={styles.button}
                >
                    default
                </Button>
                <Button
                    variant="primary"
                    className={styles.button}
                >
                    primary
                </Button>
                <Button
                    variant="accent"
                    className={styles.button}
                >
                    accent
                </Button>
                <Button
                    variant="warning"
                    className={styles.button}
                >
                    warning
                </Button>
                <Button
                    variant="danger"
                    className={styles.button}
                >
                    danger
                </Button>
                <Button
                    variant="success"
                    className={styles.button}
                >
                    success
                </Button>
            </div>
        </div>
    );
};

export default Dashboard;
