import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Map from '#remap';
import MapContainer from '#remap/MapContainer';
import MapSource from '#remap/MapSource';
import MapLayer from '#remap/MapSource/MapLayer';
import MapState from '#remap/MapSource/MapState';

import { useRequest } from '#hooks';
import NavbarContext from '#components/NavbarContext';
import SelectInput from '#components/SelectInput';
import { RegionLevelOption } from '#types';
import { generateMapPaint } from '#utils/common';


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

interface MapState {
    id: number;
    value: number;
}

interface Indicator {
    id: number;
    fullTitle: string;
}

interface DistrictIndicator {
    districtId: number;
    value: number;
}

const layerOptions = {
    type: 'line',
    'source-layer': 'default',
    layout: {
        'line-cap': 'round',
        'line-join': 'round',
    },
    paint: {
        'line-opacity': 0.6,
        'line-color': '#18bc9c',
        'line-width': 1,
    },
};


const Dashboard = (props: Props) => {
    const { className } = props;

    const [
        selectedIndicator,
        setSelectedIndicator,
    ] = React.useState<string | undefined>(undefined);

    const { regionLevel } = React.useContext(NavbarContext);
    const [
        indicatorListPending,
        indicatorListResponse,
    ] = useRequest<Indicator>('http://139.59.67.104:8060/api/v1/core/indicator-list/', requestOption);

    const provinceIndicatorListGetUrl = regionLevel === 'province' && selectedIndicator
        ? `http://139.59.67.104:8060/api/v1/core/province-indicator/${selectedIndicator}`
        : undefined;

    const districtIndicatorListGetUrl = regionLevel === 'district' && selectedIndicator
        ? `http://139.59.67.104:8060/api/v1/core/district-indicator/${selectedIndicator}`
        : undefined;

    const municipalityIndicatorListGetUrl = regionLevel === 'municipality' && selectedIndicator
        ? `http://139.59.67.104:8060/api/v1/core/municipality-indicator/${selectedIndicator}`
        : undefined;


    const [
        provinceIndicatorListPending,
        provinceIndicatorListResponse,
    ] = useRequest(provinceIndicatorListGetUrl, requestOption);

    const [
        districtIndicatorListPending,
        districtIndicatorListResponse,
    ] = useRequest<DistrictIndicator>(districtIndicatorListGetUrl, requestOption);

    const [
        municipalityIndicatorListPending,
        municipalityIndicatorListResponse,
    ] = useRequest(municipalityIndicatorListGetUrl, requestOption);

    const mapState = React.useMemo(() => {
        let state: MapState[] = [];

        if (regionLevel === 'province' && !provinceIndicatorListPending) {
            state = provinceIndicatorListResponse.data.map(d => ({
                id: d.provinceId,
                value: d.value,
            }));
        }

        if (regionLevel === 'district' && !districtIndicatorListPending) {
            state = districtIndicatorListResponse.data.map(d => ({
                id: d.districtId,
                value: d.value,
            }));
        }

        if (regionLevel === 'municipality' && !municipalityIndicatorListPending) {
            state = municipalityIndicatorListResponse.data.map(d => ({
                id: d.municipalityId,
                value: d.value,
            }));
        }

        return state;
    }, [
        regionLevel,
        provinceIndicatorListPending,
        provinceIndicatorListResponse,
        districtIndicatorListPending,
        districtIndicatorListResponse,
        municipalityIndicatorListPending,
        municipalityIndicatorListResponse,
    ]);

    const mapPaint = React.useMemo(() => {
        const valueList = mapState.map(d => d.value);
        const min = Math.min(...valueList);
        const max = Math.max(...valueList);

        const colorDomain = [
            '#31ad5c',
            '#94c475',
            '#d3dba0',
            '#fff5d8',
            '#e9bf8c',
            '#d98452',
            '#c73c32',
        ];

        const paint = generateMapPaint(colorDomain, min, max);

        return paint;
    }, [mapState]);


    const sourceOptions = {
        type: 'vector',
        tiles: tiles[regionLevel],
    };

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
                    key={regionLevel}
                >
                    <MapLayer
                        layerKey="line"
                        layerOptions={layerOptions}
                    />
                    <MapLayer
                        layerKey="fill"
                        layerOptions={{
                            type: 'fill',
                            paint: mapPaint,
                            'source-layer': 'default',
                        }}
                    />
                    <MapState
                        attributes={mapState}
                        attributeKey="value"
                        sourceLayer="default"
                    />
                </MapSource>
            </Map>
            <div className={styles.mapStyleConfigContainer}>
                <h4 className={styles.heading}>
                    Indicator
                </h4>
                <SelectInput
                    pending={indicatorListPending}
                    options={indicatorListResponse.results}
                    onChange={setSelectedIndicator}
                    value={selectedIndicator}
                    optionLabelSelector={d => d.fullTitle}
                    optionKeySelector={d => d.id}
                />
            </div>
        </div>
    );
};

export default Dashboard;
