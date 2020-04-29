import React, { useCallback } from 'react';
import { sum } from '@togglecorp/fujs';

import MapSource from '#remap/MapSource';
import MapLayer from '#remap/MapSource/MapLayer';
import MapTooltip from '#remap/MapTooltip';

import Numeral from '#components/Numeral';
import TextOutput from '#components/TextOutput';

import { Season, HospitalType, TravelTimeType } from '../types';

import theme, { visibleLayout, noneLayout } from './mapTheme';

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
function isUncoveredRegion(region: Region): region is UncoveredRegion {
    return !!(region as UncoveredRegion).GAPA_NAPA;
}

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
            <>
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
            </>
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

    return (
        <MapTooltip
            coordinates={lngLat}
            tooltipOptions={tooltipOptions}
            trackPointer
        >
            <>
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
            </>
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


    const hospitalSourceLayer = (
        (hospitalType === 'deshosp' && 'coviddesignatedhospitalsgeo')
        || (hospitalType === 'allcovidhfs' && 'covidhospitalsgeo')
        || 'allhospitalsgeo'
    );

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
                    {/*
                    <MapLayer
                        layerKey="uncovered-fill"
                        layerOptions={{
                            type: 'fill',
                            'source-layer': 'uncoveredgeo',
                            paint: {
                                'fill-color': uncoveredColor,
                                'fill-opacity': 0.4,
                            },
                            layout: travelTimeShow && selectedHospitals.length <= 0
                                ? { visibility: 'visible' }
                                : { visibility: 'none' },
                        }}
                        onMouseEnter={noOp}
                    />
                    */}
                    {/*
                    <MapLayer
                        layerKey="uncovered-line"
                        layerOptions={{
                            type: 'line',
                            'source-layer': 'uncoveredgeo',
                            paint: {
                                'line-width': 2,
                                'line-color': uncoveredDarkColor,
                                'line-opacity': [
                                    'case',
                                    ['==', ['feature-state', 'hovered'], true],
                                    1,
                                    0,
                                ],
                            },
                            layout: travelTimeShow && selectedHospitals.length <= 0
                                ? { visibility: 'visible' }
                                : { visibility: 'none' },
                        }}
                    />
                    */}
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
