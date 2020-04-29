/*
export interface InputChangeEvent<T=string|undefined> {
    value: T;
    name: string | undefined;
    originalEvent?: React.FormEvent<HTMLInputElement>;
}

export interface ButtonClickEvent {
    name: string | undefined;
    originalEvent: React.MouseEvent<HTMLButtonElement>;
}
*/

export type RegionLevelOption = 'province' | 'district' | 'municipality';

export type AgeGroupOption = 'belowFourteen' | 'fifteenToFourtyNine' | 'aboveFifty';

export interface NavbarContextProps {
    regionLevel: RegionLevelOption;
    setRegionLevel: (v: RegionLevelOption) => void;
}

export interface MultiResponse<T> {
    count: number;
    results: T[];
    data: T[]; // whut? -_-
}

// export type ListResponse<T> = T[];

export interface MapState {
    id: number;
    value: number;
}

export interface FiveW {
    id: number;
    name: string;
    code: number;
    allocatedBudget: number;
    maleBeneficiary: number;
    femaleBeneficiary: number;
    totalBeneficiary: number;
}

export interface CovidFiveW {
    id: number;
    partner: string;
    supplierCode: string;
    program?: string;
    projectName: string;
    sector: string;
    provinceCode: string;
    districtCode: string;
    municipalityCode: string;
}

export type FiveWOptionKey = Extract<keyof FiveW, 'allocatedBudget' | 'maleBeneficiary' | 'femaleBeneficiary' | 'totalBeneficiary'>;

export type CovidFiveWOptionKey = Extract<keyof CovidFiveW, 'projectName' | 'sector'>;

export type CovidFiveWRegionKey = Extract<keyof CovidFiveW, 'provinceCode' | 'districtCode' | 'municipalityCode'>;

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
