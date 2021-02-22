export type RegionLevelOption = 'province' | 'district' | 'municipality';

export interface BaseEntity {
    id: number;
    name: string;
}

export interface DomainContextProps {
    regionLevel: RegionLevelOption;
    setRegionLevel: (v: RegionLevelOption) => void;
    markers: string[];
    setMarkers: (markers: string[] | ((p: string[]) => string[])) => void;
    programs: number[];
    setPrograms: (programs: number[] | ((p: number[]) => number[])) => void;
    partners: string[];
    setPartners: (partners: string[] | ((p: string[]) => string[])) => void;
    sectors: string[];
    setSectors: (sectors: string[] | ((p: string[]) => string[])) => void;
}

export interface MultiResponse<T> {
    count: number;
    results: T[];
    data: T[]; // whut? -_-
}

// export type ListResponse<T> = T[];

export interface MapStateItem {
    id: number;
    value: number;
}

export interface Province {
    id: number;
    name: string;
    code: string;
    boundary: string;
}

export interface District {
    id: number;
    provinceId: number;
    provinceName: string;
    name: string;
    code: string;
    nCode: number;
}

export interface Municipality {
    id: number;
    name: string;
    provinceId: number;
    districtId: number;
    hlcitCode: string;
    gnTypeNp: string;
    code: string;
    population: number;
}

export interface LegendItem {
    radius: number;
    value: number;
}

interface BaseLayer {
    id: number;
    name: string;
    layerName: string;
    workspace: string;
    storeName?: string;
    filename?: string;
    description?: string;
    geoserverUrl: string;
}
export interface RasterLayer extends BaseLayer {
    type: 'raster';
}
export interface VectorLayer extends BaseLayer {
    type: 'vector';
    geoType: 'point' | 'polygon';
    identifierKey: string;
    style: {
        circleColor: string;
        circleRadius: number;
        fillColor: string;
    }[];
    popupInfo: {
        key: string;
        title: string;
        type: 'string' | 'number';
    }[];
}
export type Layer = VectorLayer | RasterLayer;
export function isRasterLayer(layer: Layer): layer is RasterLayer {
    return layer.type === 'raster';
}
export function isVectorLayer(layer: Layer): layer is VectorLayer {
    return layer.type === 'vector';
}

export interface Indicator {
    id: number;
    fullTitle: string;
    abstract: string | undefined;
    category: string;

    unit?: string;
    datatype?: 'float' | 'integer';
    federalLevel: 'all' | 'province' | 'district' | 'municipality';
}

export interface Program {
    id: number;
    name: string;
    description?: string;
    code: string;
    iati?: string;
    totalBudget: number;

    component: BaseEntity[];
    sector: BaseEntity[];
    subSector: BaseEntity[];
    markerCategory: BaseEntity[];
    markerValue: BaseEntity[];
    partner: BaseEntity[];
}

export interface Partner {
    id: number;
    name: string;
    code: string;

    description?: string;
    typeOfInstitution?: string;
    address?: string;
    email?: string;
    phoneNumber?: string;
    image?: string;
    thumbnail?: string;
}

interface LinkData {
    source: number;
    target: number;
    value: number;
}
export interface SankeyData<T> {
    minThreshold?: number;
    nodes: T[];
    links: LinkData[];
}

export interface NumericOption<T> {
    key: string;
    title: string;
    valueSelector: (value: T) => number;
    dependency?: number;
    category: string;
}

export interface BarChartSettings<T> {
    id: string;
    type: 'bar-chart';
    title: string;
    orientation?: 'horizontal' | 'vertical';

    // layout: 'vertical' | 'horizontal';
    keySelector: (value: T) => string;
    bars: {
        title: string;
        valueSelector: (value: T) => number | null;
        color: string;
        stackId?: string;
    }[];

    limit?: {
        count: number;
        method: 'min' | 'max';
        valueSelector: (value: T) => number | null;
    };

    dependencies?: number[];
}
export interface PieChartSettings<T> {
    id: string;
    type: 'pie-chart';
    title: string;

    keySelector: (value: T) => string;
    valueSelector: (value: T) => number;

    // colorPalette?: string[];

    dependencies?: number[];
}

export interface HistogramSettings<T> {
    id: string;
    type: 'histogram';
    title: string;
    valueSelector: (value: T) => number;
    color: string;
    dependencies?: number[];
    binCount: number;
}

export type ChartSettings<T> = BarChartSettings<T> | PieChartSettings<T> | HistogramSettings<T>;

export function isBarChart<T>(settings: ChartSettings<T>): settings is BarChartSettings<T> {
    return settings.type === 'bar-chart';
}
export function isPieChart<T>(settings: ChartSettings<T>): settings is PieChartSettings<T> {
    return settings.type === 'pie-chart';
}
export function isHistogram<T>(settings: ChartSettings<T>): settings is HistogramSettings<T> {
    return settings.type === 'histogram';
}

export interface IndicatorValue {
    code: string;
    value: number;
    indicatorId: number;
}

export type Bbox = [number, number, number, number];
