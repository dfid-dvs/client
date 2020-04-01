import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Map from '#remap';
import MapContainer from '#remap/MapContainer';
import MapSource from '#remap/MapSource';
import MapLayer from '#remap/MapSource/MapLayer';
import MapState from '#remap/MapSource/MapState';

import NavbarContext from '#components/NavbarContext';
import SelectInput from '#components/SelectInput';
import ChoroplethLegend from '#components/ChoroplethLegend';

import { useRequest } from '#hooks';

import { generateChoroplethMapPaintAndLegend } from '#utils/common';

import styles from './styles.css';


/*
// TODO:
1. Handle hover
2. Handle tooltip
3. Show indicators grouped by type
4. Show recent indicators
5. Show legend for indicators
6. Wait for municipality-indicator api fix
7. Bug where map-paint expects 4 but gets 2 argument
*/

interface MapState {
    id: number;
    value: number;
}

interface Indicator {
    id: number;
    fullTitle: string;
}

interface IndicatorValue {
    id: number;
    code: number;
    indicatorId: number;
    value: number;
}
const requestOption = {
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
    },
};

const defaultCenter: [number, number] = [
    84.1240, 28.3949,
];
const defaultBounds: [number, number, number, number] = [
    80.05858661752784, 26.347836996368667,
    88.20166918432409, 30.44702867091792,
];
const mapOptions = {
    logoPosition: 'top-left',
    minZoom: 5,
    zoom: 3,
    center: defaultCenter,
    bounds: defaultBounds,
};

interface Props {
    className?: string;
}

const Dashboard = (props: Props) => {
    const { className } = props;

    const { regionLevel } = React.useContext(NavbarContext);
    const showProvince = regionLevel === 'province';
    const showDistrict = regionLevel === 'district';
    const showMunicipality = regionLevel === 'municipality';

    const [
        selectedIndicator,
        setSelectedIndicator,
    ] = React.useState<number | undefined>(undefined);

    const provinceIndicatorListGetUrl = showProvince && selectedIndicator
        ? `http://139.59.67.104:8060/api/v1/core/province-indicator/${selectedIndicator}`
        : undefined;

    const districtIndicatorListGetUrl = showDistrict && selectedIndicator
        ? `http://139.59.67.104:8060/api/v1/core/district-indicator/${selectedIndicator}`
        : undefined;

    const municipalityIndicatorListGetUrl = showMunicipality && selectedIndicator
        ? `http://139.59.67.104:8060/api/v1/core/municipality-indicator/?indicator_id=${selectedIndicator}`
        : undefined;

    const indicatorListGetUrl = 'http://139.59.67.104:8060/api/v1/core/indicator-list/';

    const [
        indicatorListPending,
        indicatorListResponse,
    ] = useRequest<Indicator>(indicatorListGetUrl, requestOption);

    const [
        provinceIndicatorListPending,
        provinceIndicatorListResponse,
    ] = useRequest<IndicatorValue>(provinceIndicatorListGetUrl, requestOption);

    const [
        districtIndicatorListPending,
        districtIndicatorListResponse,
    ] = useRequest<IndicatorValue>(districtIndicatorListGetUrl, requestOption);

    const [
        municipalityIndicatorListPending,
        municipalityIndicatorListResponse,
    ] = useRequest<IndicatorValue>(municipalityIndicatorListGetUrl, requestOption);

    const provinceMapState = React.useMemo(
        () => {
            let state: MapState[] = [];
            if (provinceIndicatorListPending) {
                return state;
            }
            state = provinceIndicatorListResponse.results.map(d => ({
                id: d.code,
                value: d.value,
            }));
            return state;
        },
        [provinceIndicatorListPending, provinceIndicatorListResponse],
    );

    const districtMapState = React.useMemo(
        () => {
            let state: MapState[] = [];
            if (districtIndicatorListPending) {
                return state;
            }
            state = districtIndicatorListResponse.results.map(d => ({
                id: d.code,
                value: d.value,
            }));
            return state;
        },
        [districtIndicatorListPending, districtIndicatorListResponse],
    );

    const municipalityMapState = React.useMemo(
        () => {
            let state: MapState[] = [];
            if (municipalityIndicatorListPending) {
                return state;
            }
            state = municipalityIndicatorListResponse.results.map(d => ({
                id: d.code,
                value: d.value,
            }));
            return state;
        },
        [municipalityIndicatorListPending, municipalityIndicatorListResponse],
    );

    const {
        paint: mapPaint,
        legend: mapLegend,
        min: dataMinValue,
    } = React.useMemo(
        () => {
            let mapState: MapState[] = [];
            switch (regionLevel) {
                case 'municipality':
                    mapState = municipalityMapState;
                    break;
                case 'district':
                    mapState = districtMapState;
                    break;
                case 'province':
                    mapState = provinceMapState;
                    break;
                default:
                    break;
            }

            const valueList = mapState.map(d => d.value);

            const min = Math.min(...valueList);
            const max = Math.max(...valueList);

            const colorDomain = [
                '#004c7d',
                '#316291',
                '#5078a6',
                '#6e90bb',
                '#8ba8d1',
                '#a8c1e7',
            ];

            return {
                min,
                ...generateChoroplethMapPaintAndLegend(colorDomain, min, max),
            };
        },
        [
            provinceMapState,
            districtMapState,
            municipalityMapState,
            regionLevel,
        ],
    );

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
                    sourceKey="nepal"
                    sourceOptions={{
                        type: 'vector',
                        url: 'mapbox://adityakhatri.4p8awf71',
                    }}
                >
                    {showMunicipality && (
                        <>
                            <MapLayer
                                layerKey="palika-fill"
                                layerOptions={{
                                    type: 'fill',
                                    'source-layer': 'palikageo',
                                    paint: mapPaint,
                                }}
                            />
                            <MapLayer
                                layerKey="palika-line"
                                layerOptions={{
                                    type: 'line',
                                    'source-layer': 'palikageo',
                                    // layout: showMunicipality ? visibleLayout : noneLayout,
                                    paint: {
                                        'line-color': '#000000',
                                        'line-width': 1,
                                        'line-opacity': 0.2,
                                    },
                                }}
                            />
                        </>
                    )}
                    {showDistrict && (
                        <>
                            <MapLayer
                                layerKey="district-fill"
                                layerOptions={{
                                    type: 'fill',
                                    'source-layer': 'districtgeo',
                                    paint: mapPaint,
                                }}
                            />
                            <MapLayer
                                layerKey="district-line"
                                layerOptions={{
                                    type: 'line',
                                    'source-layer': 'districtgeo',
                                    // layout: showDistrict ? visibleLayout : noneLayout,
                                    paint: {
                                        'line-color': '#000000',
                                        'line-width': 1,
                                        'line-opacity': 0.3,
                                    },
                                }}
                            />
                        </>
                    )}
                    {showProvince && (
                        <>
                            <MapLayer
                                layerKey="province-fill"
                                layerOptions={{
                                    type: 'fill',
                                    'source-layer': 'provincegeo',
                                    paint: mapPaint,
                                }}
                            />
                            <MapLayer
                                layerKey="province-line"
                                layerOptions={{
                                    type: 'line',
                                    'source-layer': 'provincegeo',
                                    // layout: showProvince ? visibleLayout : noneLayout,
                                    paint: {
                                        'line-color': '#000000',
                                        'line-width': 1,
                                        'line-opacity': 0.4,
                                    },
                                }}
                            />
                        </>
                    )}

                    {showProvince && (
                        <MapState
                            attributes={provinceMapState}
                            attributeKey="value"
                            sourceLayer="provincegeo"
                        />
                    )}
                    {showDistrict && (
                        <MapState
                            attributes={districtMapState}
                            attributeKey="value"
                            sourceLayer="districtgeo"
                        />
                    )}
                    {showMunicipality && (
                        <MapState
                            attributes={municipalityMapState}
                            attributeKey="value"
                            sourceLayer="palikageo"
                        />
                    )}
                </MapSource>
            </Map>
            <div className={styles.mapStyleConfigContainer}>
                <h4 className={styles.heading}>
                    Indicator
                </h4>
                <SelectInput
                    className={styles.indicatorSelectInput}
                    disabled={indicatorListPending}
                    options={indicatorListResponse.results}
                    onChange={setSelectedIndicator}
                    value={selectedIndicator}
                    optionLabelSelector={d => d.fullTitle}
                    optionKeySelector={d => d.id}
                />
                { Object.keys(mapLegend).length > 0 && (
                    <ChoroplethLegend
                        className={styles.legend}
                        minValue={dataMinValue}
                        legend={mapLegend}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
