export type RegionLevelOption = 'province' | 'district' | 'municipality';

export interface BaseEntity {
    id: number;
    name: string;
}

export interface DomainContextProps {
    regionLevel: RegionLevelOption;
    setRegionLevel: (v: RegionLevelOption) => void;
    covidMode: boolean;
    setCovidMode: (m: boolean) => void;
    programs: number[];
    setPrograms: (programs: number[]) => void;
}

export interface NavbarContextProps {
    parentNode: HTMLDivElement | null | undefined;
    setParentNode: (node: HTMLDivElement | null | undefined) => void;
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
    totalBudget: number;

    sector: BaseEntity[];
    subSector: BaseEntity[];
    markerCategory: BaseEntity[];
    markerValue: BaseEntity[];
    // partner: BaseEntity[];
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
