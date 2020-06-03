export type RegionLevelOption = 'province' | 'district' | 'municipality';

export interface DomainContextProps {
    regionLevel: RegionLevelOption;
    setRegionLevel: (v: RegionLevelOption) => void;
    covidMode: boolean;
    setCovidMode: (m: boolean) => void;
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

export interface Layer {
    id: number;
    name: string;
    layerName: string;
    workspace: string;
    geoserverUrl: string;
    type: 'raster' | 'vector';
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
