import React, { useCallback, useMemo } from 'react';
import { sum } from '@togglecorp/fujs';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

import MapSource from '#remap/MapSource';
import MapLayer from '#remap/MapSource/MapLayer';
import MapTooltip from '#remap/MapTooltip';

import Numeral, { formatNumber } from '#components/Numeral';
import TextOutput from '#components/TextOutput';

import { Season, HospitalType, TravelTimeType } from '../types';

import theme, { visibleLayout, noneLayout } from './mapTheme';

import styles from './styles.css';

export function TravelTimeDetails() {
    return (
        <span>
            These maps show the catchment areas of COVID hospitals in Nepal based on
            one-way travel time cutoffs of 4 / 8 / 12 hours using the fastest possible
            means of transport, which roughly correspond to 1 / 2 / 3 day round trips.
            The uncovered layers show the inverse of these catchments.
            Population from
            <a
                className={styles.link}
                href="https://www.worldpop.org/project/categories?id=3"
                target="_blank"
                rel="noopener noreferrer"
            >
                WorldPop 2020 projections.
            </a>
            <a
                className={styles.link}
                href="http://documents.worldbank.org/curated/en/605991565195559324/Measuring-Inequality-of-Access-Modeling-Physical-Remoteness-in-Nepal"
                target="_blank"
                rel="noopener noreferrer"
            >
                Travel time models from Banick and Kawasoe (2019)
            </a>
        </span>
    );
}


// const uncoveredColor = '#455a64';
// const uncoveredDarkColor = '#1c313a';

// const noOp = () => {};

export interface DesignatedHospital {
    name: string;
    category__name: string;
    type__name: string;
    contact_num: string;
}
type SelectedHospital = GeoJSON.Feature<GeoJSON.Point, DesignatedHospital>;

export interface TravelTimeRegion {
    f_5: number;
    f_10: number;
    f_15: number;
    f_20: number;
    f_25: number;
    f_30: number;
    f_35: number;
    f_40: number;
    f_45: number;
    f_50: number;
    f_55: number;
    f_60: number;
    f_65: number;
    f_70: number;
    f_75: number;
    f_80: number;
    m_5: number;
    m_10: number;
    m_15: number;
    m_20: number;
    m_25: number;
    m_30: number;
    m_35: number;
    m_40: number;
    m_45: number;
    m_50: number;
    m_55: number;
    m_60: number;
    m_65: number;
    m_70: number;
    m_75: number;
    m_80: number;
}

interface CatchmentRegion extends TravelTimeRegion {
    name: string;
}
interface UncoveredRegion extends TravelTimeRegion {
    GAPA_NAPA: string;
}
type Region = CatchmentRegion | UncoveredRegion;
type SelectedTravelTimeRegion = GeoJSON.Feature<GeoJSON.Point, Region>;
function isCatchmentRegion(region: Region): region is CatchmentRegion {
    return !!(region as CatchmentRegion).name;
}
/*
function isUncoveredRegion(region: Region): region is UncoveredRegion {
    return !!(region as UncoveredRegion).GAPA_NAPA;
}
*/

function getTotalMalePopulation(region: TravelTimeRegion) {
    const result = sum([
        region.m_5, region.m_10, region.m_15, region.m_20, region.m_25, region.m_30,
        region.m_35, region.m_40, region.m_45, region.m_50, region.m_55, region.m_60,
        region.m_65, region.m_70, region.m_75, region.m_80,
    ]);
    return Math.round(result);
}
function getTotalFemalePopulation(region: TravelTimeRegion) {
    const result = sum([
        region.f_5, region.f_10, region.f_15, region.f_20, region.f_25, region.f_30,
        region.f_35, region.f_40, region.f_45, region.f_50, region.f_55, region.f_60,
        region.f_65, region.f_70, region.f_75, region.f_80,
    ]);
    return Math.round(result);
}
function getTotalPopulation(region: TravelTimeRegion) {
    return getTotalMalePopulation(region) + getTotalFemalePopulation(region);
}

const tooltipOptions: mapboxgl.PopupOptions = {
    closeOnClick: false,
    closeButton: false,
    offset: 8,
    maxWidth: '480px',
};

interface HospitalTooltipProps {
    lngLat: mapboxgl.LngLatLike;
    feature: SelectedHospital;
}
function HospitalTooltip(props: HospitalTooltipProps) {
    const {
        lngLat,
        feature: {
            properties: {
                name,
                category__name: categoryName,
                type__name: typeName,
                contact_num: contactNumber,
            },
        },
    } = props;
    return (
        <MapTooltip
            coordinates={lngLat}
            tooltipOptions={tooltipOptions}
            trackPointer
        >
            <div className={styles.hospitalTooltip}>
                <h3>
                    {name}
                </h3>
                <TextOutput
                    label="Category"
                    value={categoryName}
                />
                <TextOutput
                    label="Type"
                    value={typeName}
                />
                <TextOutput
                    label="Contact"
                    value={contactNumber}
                />
            </div>
        </MapTooltip>
    );
}

interface RegionTooltipProps {
    lngLat: mapboxgl.LngLatLike;
    feature: SelectedTravelTimeRegion;
}
function RegionTooltip(props: RegionTooltipProps) {
    const {
        lngLat,
        feature: {
            properties,
        },
    } = props;


    let header = '';
    let totalPopulationHeader = '';
    if (isCatchmentRegion(properties)) {
        header = properties.name;
        totalPopulationHeader = 'Total Population';
    } else {
        header = properties.GAPA_NAPA;
        totalPopulationHeader = 'Uncovered Population';
    }

    const data = useMemo(
        () => ([
            { name: '80', male: properties.m_80, female: -properties.f_80 },
            { name: '75', male: properties.m_75, female: -properties.f_75 },
            { name: '70', male: properties.m_70, female: -properties.f_70 },
            { name: '65', male: properties.m_65, female: -properties.f_65 },
            { name: '60', male: properties.m_60, female: -properties.f_60 },
            { name: '55', male: properties.m_55, female: -properties.f_55 },
            { name: '50', male: properties.m_50, female: -properties.f_50 },
            { name: '45', male: properties.m_45, female: -properties.f_45 },
            { name: '40', male: properties.m_40, female: -properties.f_40 },
            { name: '35', male: properties.m_35, female: -properties.f_35 },
            { name: '30', male: properties.m_30, female: -properties.f_30 },
            { name: '25', male: properties.m_25, female: -properties.f_25 },
            { name: '20', male: properties.m_20, female: -properties.f_20 },
            { name: '15', male: properties.m_15, female: -properties.f_15 },
            { name: '10', male: properties.m_10, female: -properties.f_10 },
            { name: '5', male: properties.m_5, female: -properties.f_5 },
        ]),
        [properties],
    );

    const tickFormatter = useCallback(
        (value: number) => {
            const absoluteValue = Math.abs(value);
            return formatNumber(absoluteValue, true, true);
        },
        [],
    );

    return (
        <MapTooltip
            coordinates={lngLat}
            tooltipOptions={tooltipOptions}
            trackPointer
        >
            <div className={styles.hospitalTooltip}>
                <h3>
                    {header}
                </h3>
                <TextOutput
                    label={totalPopulationHeader}
                    value={(
                        <Numeral
                            value={getTotalPopulation(properties)}
                            precision={0}
                        />
                    )}
                />
                <TextOutput
                    label="Female"
                    value={(
                        <Numeral
                            value={getTotalFemalePopulation(properties)}
                            precision={0}
                        />
                    )}
                />
                <TextOutput
                    label="Male"
                    value={(
                        <Numeral
                            value={getTotalMalePopulation(properties)}
                            precision={0}
                        />
                    )}
                />
                <h4>
                    Age distribution
                </h4>
                <BarChart
                    width={300}
                    height={200}
                    data={data}
                    margin={{
                        top: 0, right: 0, left: 0, bottom: 0,
                    }}
                    stackOffset="sign"
                    layout="vertical"
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                    />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={30}
                    />
                    <XAxis
                        type="number"
                        tickFormatter={tickFormatter}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                        dataKey="male"
                        stackId="total"
                        fill="#02a3fe"
                    />
                    <Bar
                        dataKey="female"
                        stackId="total"
                        fill="#ec49a6"
                    />
                </BarChart>
            </div>
        </MapTooltip>
    );
}

interface Props {
    selectedHospitals: string[];
    onHospitalClick: (feature: mapboxgl.MapboxGeoJSONFeature) => boolean;
    travelTimeShown?: boolean;

    prefix?: string;
    season?: Season['key'];
    hospitalType?: HospitalType['key'];
    travelTimeType?: TravelTimeType['key'];
}

function TravelTimeLayer(props: Props) {
    const {
        selectedHospitals,
        onHospitalClick,

        travelTimeShown,
        prefix,

        hospitalType,
        season,
        travelTimeType,
    } = props;

    const [
        designatedHospitalProperties,
        setDesignatedHospitalProperties,
    ] = React.useState<{ lngLat: mapboxgl.LngLatLike; feature: SelectedHospital }>();

    const handleDesignatedHospitalTooltipOpen = useCallback(
        (
            feature: mapboxgl.MapboxGeoJSONFeature,
            lngLat: mapboxgl.LngLat,
        ) => {
            setDesignatedHospitalProperties({
                lngLat,
                feature: feature as unknown as SelectedHospital,
            });
            return true;
        },
        [],
    );

    const handleDesignatedHospitalTooltipHide = useCallback(
        () => {
            setDesignatedHospitalProperties(undefined);
        },
        [],
    );

    const [
        travelTimeRegionProperties,
        setTravelTimeRegionProperties,
    ] = React.useState<{ lngLat: mapboxgl.LngLatLike; feature: SelectedTravelTimeRegion }>();

    const handleTravelTimeRegionOpen = useCallback(
        (
            feature: mapboxgl.MapboxGeoJSONFeature,
            lngLat: mapboxgl.LngLat,
        ) => {
            setTravelTimeRegionProperties({
                lngLat,
                feature: feature as unknown as SelectedTravelTimeRegion,
            });
            return true;
        },
        [],
    );

    const handleTravelTimeRegionHide = useCallback(
        () => {
            setTravelTimeRegionProperties(undefined);
        },
        [],
    );


    const hospitalSourceLayer = hospitalType === 'deshosp'
        ? 'coviddesignatedhospitalsgeo'
        : 'covidhospitalsgeo';

    const catchmentUrl = (
        (hospitalType === 'deshosp' && season === 'dry' && 'mapbox://togglecorp.265cfnxb')
        || (hospitalType === 'deshosp' && season === 'msn' && 'mapbox://togglecorp.1blomcjm')
        || (hospitalType === 'allcovidhfs' && season === 'dry' && 'mapbox://togglecorp.0s4o7p46')
        || (hospitalType === 'allcovidhfs' && season === 'msn' && 'mapbox://togglecorp.b26l1lz5')
        || undefined
    );

    const uncoveredUrl = (
        (hospitalType === 'deshosp' && season === 'dry' && 'mapbox://togglecorp.8z1qrkb2')
        || (hospitalType === 'deshosp' && season === 'msn' && 'mapbox://togglecorp.ccbtdr4y')
        || (hospitalType === 'allcovidhfs' && season === 'dry' && 'mapbox://togglecorp.8qpnv16e')
        || (hospitalType === 'allcovidhfs' && season === 'msn' && 'mapbox://togglecorp.3ceodz8w')
        || undefined
    );

    const catchmentFilter = selectedHospitals.length <= 0
        ? undefined
        : ['in', ['get', 'name'], ['literal', selectedHospitals]];

    const uncoveredFilter = ['!=', ['get', 'GAPA_NAPA'], 'Koshi Tappu Wildlife Reserve'];

    const uncoveredLayout = travelTimeShown && travelTimeType === 'uncovered'
        ? visibleLayout
        : noneLayout;
    const catchmentLayout = travelTimeShown && travelTimeType === 'catchment'
        ? visibleLayout
        : noneLayout;

    return (
        <>
            {uncoveredUrl && (
                <MapSource
                    sourceKey={`${prefix}-uncovered`}
                    sourceOptions={{
                        type: 'vector',
                        url: uncoveredUrl,
                    }}
                >
                    <MapLayer
                        layerKey="fourhour-fill"
                        layerOptions={{
                            type: 'fill',
                            'source-layer': 'fourhourgeo',
                            paint: theme.uncovered.fourhour.fillPaint,
                            layout: uncoveredLayout,
                            filter: uncoveredFilter,
                        }}
                        onMouseEnter={handleTravelTimeRegionOpen}
                        onMouseLeave={handleTravelTimeRegionHide}
                    />
                    <MapLayer
                        layerKey="eighthour-fill"
                        layerOptions={{
                            type: 'fill',
                            'source-layer': 'eighthourgeo',
                            paint: theme.uncovered.eighthour.fillPaint,
                            layout: uncoveredLayout,
                            filter: uncoveredFilter,
                        }}
                        onMouseEnter={handleTravelTimeRegionOpen}
                        onMouseLeave={handleTravelTimeRegionHide}
                    />
                    <MapLayer
                        layerKey="twelvehour-fill"
                        layerOptions={{
                            type: 'fill',
                            'source-layer': 'twelvehourgeo',
                            paint: theme.uncovered.twelvehour.fillPaint,
                            layout: uncoveredLayout,
                            filter: uncoveredFilter,
                        }}
                        onMouseEnter={handleTravelTimeRegionOpen}
                        onMouseLeave={handleTravelTimeRegionHide}
                    />

                    <MapLayer
                        layerKey="fourhour-line"
                        layerOptions={{
                            type: 'line',
                            'source-layer': 'fourhourgeo',
                            paint: theme.uncovered.fourhour.linePaint,
                            layout: uncoveredLayout,
                            filter: uncoveredFilter,
                        }}
                    />
                    <MapLayer
                        layerKey="eighthour-line"
                        layerOptions={{
                            type: 'line',
                            'source-layer': 'eighthourgeo',
                            paint: theme.uncovered.eighthour.linePaint,
                            layout: uncoveredLayout,
                            filter: uncoveredFilter,
                        }}
                    />
                    <MapLayer
                        layerKey="twelvehour-line"
                        layerOptions={{
                            type: 'line',
                            'source-layer': 'twelvehourgeo',
                            paint: theme.uncovered.twelvehour.linePaint,
                            layout: uncoveredLayout,
                            filter: uncoveredFilter,
                        }}
                    />
                </MapSource>
            )}
            {catchmentUrl && (
                <MapSource
                    sourceKey={`${prefix}-catchment`}
                    sourceOptions={{
                        type: 'vector',
                        url: catchmentUrl,
                    }}
                >
                    <MapLayer
                        layerKey="twelvehour-fill"
                        layerOptions={{
                            type: 'fill',
                            'source-layer': 'twelvehourgeo',
                            paint: theme.catchment.twelvehour.fillPaint,
                            filter: catchmentFilter,
                            layout: catchmentLayout,
                        }}
                        onMouseEnter={handleTravelTimeRegionOpen}
                        onMouseLeave={handleTravelTimeRegionHide}
                    />
                    <MapLayer
                        layerKey="eighthour-fill"
                        layerOptions={{
                            type: 'fill',
                            'source-layer': 'eighthourgeo',
                            paint: theme.catchment.eighthour.fillPaint,
                            filter: catchmentFilter,
                            layout: catchmentLayout,
                        }}
                        onMouseEnter={handleTravelTimeRegionOpen}
                        onMouseLeave={handleTravelTimeRegionHide}
                    />
                    <MapLayer
                        layerKey="fourhour-fill"
                        layerOptions={{
                            type: 'fill',
                            'source-layer': 'fourhourgeo',
                            paint: theme.catchment.fourhour.fillPaint,
                            filter: catchmentFilter,
                            layout: catchmentLayout,
                        }}
                        onMouseEnter={handleTravelTimeRegionOpen}
                        onMouseLeave={handleTravelTimeRegionHide}
                    />

                    <MapLayer
                        layerKey="twelvehour-line"
                        layerOptions={{
                            type: 'line',
                            'source-layer': 'twelvehourgeo',
                            paint: theme.catchment.twelvehour.linePaint,
                            filter: catchmentFilter,
                            layout: catchmentLayout,
                        }}
                    />
                    <MapLayer
                        layerKey="eighthour-line"
                        layerOptions={{
                            type: 'line',
                            'source-layer': 'eighthourgeo',
                            paint: theme.catchment.eighthour.linePaint,
                            filter: catchmentFilter,
                            layout: catchmentLayout,
                        }}
                    />
                    <MapLayer
                        layerKey="fourhour-line"
                        layerOptions={{
                            type: 'line',
                            'source-layer': 'fourhourgeo',
                            paint: theme.catchment.fourhour.linePaint,
                            filter: catchmentFilter,
                            layout: catchmentLayout,
                        }}
                    />
                </MapSource>
            )}
            <MapSource
                sourceKey={`${prefix}-hospitals`}
                sourceOptions={{
                    type: 'vector',
                    url: 'mapbox://togglecorp.7sfpl5br',
                }}
            >
                <MapLayer
                    layerKey="hospital-circle"
                    layerOptions={{
                        type: 'circle',
                        'source-layer': hospitalSourceLayer,
                        // FIXME: memoize this
                        paint: theme.hospital.circlePaint(selectedHospitals),
                    }}
                    onMouseEnter={handleDesignatedHospitalTooltipOpen}
                    onMouseLeave={handleDesignatedHospitalTooltipHide}
                    onClick={onHospitalClick}
                />
                <MapLayer
                    layerKey="hospital-symbol"
                    layerOptions={{
                        type: 'symbol',
                        'source-layer': hospitalSourceLayer,
                        paint: theme.hospital.symbolPaint,
                        layout: theme.hospital.symbolLayout,
                    }}
                />
                {designatedHospitalProperties && (
                    <HospitalTooltip
                        lngLat={designatedHospitalProperties.lngLat}
                        feature={designatedHospitalProperties.feature}
                    />
                )}
                {travelTimeRegionProperties && (
                    <RegionTooltip
                        lngLat={travelTimeRegionProperties.lngLat}
                        feature={travelTimeRegionProperties.feature}
                    />
                )}
            </MapSource>
        </>
    );
}
export default TravelTimeLayer;
