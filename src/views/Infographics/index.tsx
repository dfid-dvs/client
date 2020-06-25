import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { FaMale, FaFemale } from 'react-icons/fa';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, LabelList } from 'recharts';

import Map from '#remap';
import MapContainer from '#remap/MapContainer';
import MapSource from '#remap/MapSource';
import MapLayer from '#remap/MapSource/MapLayer';
import MapBounds from '#remap/MapBounds';

import useRequest from '#hooks/useRequest';
import {
    MultiResponse,
    IndicatorValue,
} from '#types';
import { apiEndPoint } from '#utils/constants';

import { OriginalFiveW } from '#views/Dashboard/types';
import DomainContext from '#components/DomainContext';
import SingleRegionSelect from '#components/SingleRegionSelect';
import Numeral from '#components/Numeral';

import styles from './styles.css';

interface Props {
    className?: string;
}

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
    interactive: false,
};

// --- numbers ---
// Financial institution
// Health facilities
// Estimated population
// Poverty gap
// +Food Poverty gap
// Total budget
// No. of programs
// No. of partners
// No. of sectors
// No. of subregion
// GDP
// Per capita income
// Area
// Average travel time to nearest health facility

// ---- charts ----
// Male / Female population distribtion (Barchart)
// Landcover (Piechart)
// Partner's spend percentage (Piechart)
// Sector's spend percentage (Piechart)

const numericDataList = [
    { key: 'finance', label: 'Financial institutions', value: 0 },
    { key: 'health', label: 'Health facilities', value: 0 },
    { key: 'healthPerThousand', label: 'Health facilities / 1000 person', value: 0 },
    { key: 'population', label: 'Population', value: 0 },
    { key: 'povertyGap', label: 'Poverty gap', value: 0 },
    { key: 'budget', label: 'Total budget', value: 0 },
    { key: 'programs', label: 'Programs', value: 0 },
    { key: 'partners', label: 'Partners (1st tier)', value: 0 },
    { key: 'sectors', label: 'Sectors', value: 0 },
    { key: 'subSectors', label: 'Subsectors', value: 0 },
    { key: 'gdp', label: 'GDP', value: 0 },
    { key: 'perCapitaIncome', label: 'Per capita income', value: 0 },
];

const outlinePaint: mapboxgl.LinePaint = {
    'line-color': '#000000',
    'line-width': 0.1,
};

const populationData = [
    { key: 'male', label: 'Male', value: 2549, color: '#55cdfc' },
    { key: 'female', label: 'Female', value: 3622, color: '#f7a8b8' },
];

function NumberOutput(p: {
    label: string;
    value: number;
}) {
    const {
        label,
        value,
    } = p;

    return (
        <div className={styles.numberOutput}>
            <Numeral
                className={styles.value}
                value={value}
                normalize
            />
            <div className={styles.label}>
                { label }
            </div>
        </div>
    );
}

function renderGenderTick(data: {
    x: number;
    y: number;
    payload: { value: 'male' | 'female' };
}) {
    const iconMap = {
        male: FaMale,
        female: FaFemale,
    };

    const gender = data.payload.value;
    const Icon = iconMap[gender];

    if (Icon) {
        return (
            <Icon
                className={_cs(styles.icon, styles[gender])}
                x={data.x - 18}
                y={data.y - 12}
            />
        );
    }

    return null;
}

interface FiveW {
    allocatedBudget: number;
    programId: number;
    supplierId: number;
    componentId: number;
}

function getDistinctAttributeCount<T, U>(list: T[], itemSelector: (el: T) => U) {
    return [...new Set(list.map(d => itemSelector(d)))].length;
}

function getAccumulatedAttributeValue<T>(list: T[], itemSelector: (el: T) => number) {
    return [...new Set(list.map(d => itemSelector(d)))].reduce((acc, val) => acc + val, 0);
}

function Infographics(props: Props) {
    const { className } = props;
    const {
        regionLevel,
        setRegionLevel,
    } = React.useContext(DomainContext);

    const [region, setRegion] = React.useState<number | undefined>(undefined);

    const regionFiveWUrl = `${apiEndPoint}/core/fivew-${regionLevel}/`;
    const regionFiveWRequestOptions: RequestInit | undefined = React.useMemo(
        () => ({
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                programId: [],
            }),
        }),
        [],
    );

    const indicatorUrl = `${apiEndPoint}/core/${regionLevel}-indicator/`;
    const indicatorRequestOptions: RequestInit | undefined = React.useMemo(
        () => ({
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                // 25: estimated population
                // 133: Poverty gap
                // 118: Financial institution
                // 119: Health facilities
                // 145: Health facilities per 1000 person
                indicatorId: [25, 54, 118, 119, 145],
            }),
        }),
        [],
    );

    const [, indicatorResponse] = useRequest<MultiResponse<IndicatorValue>>(indicatorUrl, 'indicator', indicatorRequestOptions);

    const indicatorData = React.useMemo(() => {
        if (indicatorResponse) {
            const indicatorList = indicatorResponse.results.filter(d => +d.code === region);

            const estimatedPopulationList = indicatorList.filter(d => d.indicatorId === 25);
            const povertyGapList = indicatorList.filter(d => d.indicatorId === 54);
            const financialInstitutionList = indicatorList.filter(d => d.indicatorId === 118);
            const healthFacilityList = indicatorList.filter(d => d.indicatorId === 119);
            const healthFacilityPerThousandList = indicatorList
                .filter(d => d.indicatorId === 145);

            const estimatedPopulation = getAccumulatedAttributeValue(
                estimatedPopulationList,
                d => d.value,
            );
            const povertyGap = getAccumulatedAttributeValue(povertyGapList, d => d.value);
            const financialInstitution = getAccumulatedAttributeValue(
                financialInstitutionList, d => d.value,
            );
            const healthFacility = getAccumulatedAttributeValue(healthFacilityList, d => d.value);
            const healthFacilityPerThousand = getAccumulatedAttributeValue(
                healthFacilityPerThousandList, d => d.value,
            );

            return {
                population: estimatedPopulation,
                povertyGap,
                finance: financialInstitution,
                health: healthFacility,
                healthPerThousand: healthFacilityPerThousand,
            };
        }

        return {};
    }, [indicatorResponse, region]);

    // console.warn(indicatorList);

    const [, aggregatedFiveWResponse] = useRequest<MultiResponse<OriginalFiveW>>(regionFiveWUrl, 'fivew', regionFiveWRequestOptions);
    const regionData = React.useMemo(() => {
        const data = {
            budget: 0,
            name: 'Region',
            partners: 0,
            sectors: 0,
            subSectors: 0,
            components: 0,
        };

        if (!aggregatedFiveWResponse) {
            return data;
        }

        const currentRegion = aggregatedFiveWResponse.results.find(d => +d.code === region);
        console.warn(currentRegion);

        if (currentRegion) {
            data.name = currentRegion.name;
            data.budget = currentRegion.allocatedBudget;
            data.partners = currentRegion.partner.length;
            data.sectors = currentRegion.sector.length;
            data.subSectors = currentRegion.subSector.length;
            data.components = currentRegion.component.length;
        }

        return data;
    }, [aggregatedFiveWResponse, region]);

    return (
        <div className={_cs(className, styles.infographics)}>
            <header className={styles.header}>
                <SingleRegionSelect
                    className={styles.regionSelector}
                    onRegionLevelChange={setRegionLevel}
                    regionLevel={regionLevel}
                    region={region}
                    onRegionChange={setRegion}
                />
            </header>
            <div className={styles.content}>
                <div className={styles.infographicsContent}>
                    <div className={styles.headerRow}>
                        <div className={styles.regionDetails}>
                            <div className={styles.basicInfo}>
                                <div className={styles.regionName}>
                                    { regionData.name }
                                </div>
                                <div className={styles.parentRegionDetails}>
                                    Parent region
                                </div>
                            </div>
                            <div className={styles.regionGeoInfo}>
                                <div className={styles.subRegionDetails}>
                                    <div className={styles.value}>
                                        10
                                    </div>
                                    <div className={styles.label}>
                                        Subregions
                                    </div>
                                </div>
                                <div className={styles.area}>
                                    <div className={styles.value}>
                                        28.2
                                    </div>
                                    <div className={styles.label}>
                                        Area (sq. km)
                                    </div>
                                </div>
                            </div>
                            <div className={styles.populationDetails}>
                                <ResponsiveContainer>
                                    <BarChart
                                        className={styles.barChart}
                                        data={populationData}
                                        layout="vertical"
                                        margin={{
                                            top: 0,
                                            right: 0,
                                            bottom: 0,
                                            left: 0,
                                        }}
                                    >
                                        <XAxis
                                            dataKey="value"
                                            type="number"
                                            hide
                                        />
                                        <YAxis
                                            width={32}
                                            dataKey="key"
                                            type="category"
                                            tick={renderGenderTick}
                                            interval={0}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Bar dataKey="value">
                                            { populationData.map(d => (
                                                <Cell key={d.key} fill={d.color} />
                                            ))}
                                            <LabelList dataKey="value" position="insideRight" />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <Map
                            mapStyle="mapbox://styles/togglecorp/ck9av67fu0i441ipd23xm7o0w"
                            mapOptions={mapOptions}
                            scaleControlShown={false}
                            navControlShown={false}
                        >
                            <MapContainer className={styles.mapContainer} />
                            <MapSource
                                sourceKey="nepal"
                                sourceOptions={{
                                    type: 'vector',
                                    url: 'mapbox://togglecorp.2p8uqg5e',
                                }}
                            >
                                { regionLevel === 'province' && (
                                    <MapLayer
                                        layerKey="province-line"
                                        layerOptions={{
                                            type: 'line',
                                            'source-layer': 'provincegeo',
                                            paint: outlinePaint,
                                        }}
                                    />
                                )}
                                { regionLevel === 'district' && (
                                    <MapLayer
                                        layerKey="district-line"
                                        layerOptions={{
                                            type: 'line',
                                            'source-layer': 'districtgeo',
                                            paint: outlinePaint,
                                        }}
                                    />
                                )}
                                { regionLevel === 'municipality' && (
                                    <MapLayer
                                        layerKey="municipality-line"
                                        layerOptions={{
                                            type: 'line',
                                            'source-layer': 'palikageo',
                                            paint: outlinePaint,
                                        }}
                                    />
                                )}
                            </MapSource>
                            <MapBounds
                                bounds={defaultBounds}
                                padding={100}
                            />
                        </Map>
                    </div>
                    <div className={styles.row}>
                        { numericDataList.map(d => (
                            <NumberOutput
                                value={regionData[d.key] || indicatorData[d.key] || d.value}
                                label={d.label}
                                key={d.key}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Infographics;
