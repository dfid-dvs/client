export type RegionLevelOption = 'province' | 'district' | 'municipality';

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

export interface MapStateItem {
    id: number;
    value: number;
}

export interface MapStateFiveWData extends MapState {
    data?: CovidFiveW[];
}

export interface FiveWTooltipData {
    id: number;
    data?: CovidFiveW[];
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
    provinceCode: string;
    districtCode: string;
    municipalityCode: string;
    component: string;
    secondTierPartner: string;
    projectStatus: string;
    sector: string;
    budget: string;
    kathmanduActivity: string;
    deliveryInLockdown: string;
    covidPriority_3_12_Months: string;
    covidRecoveryPriority: string;
    providingTaToLocalGovernment: string;
}

export type FiveWOptionKey = Extract<keyof FiveW, 'allocatedBudget' | 'maleBeneficiary' | 'femaleBeneficiary' | 'totalBeneficiary'>;

export type CovidFiveWOptionKey = Extract<keyof CovidFiveW, 'component' | 'sector' | 'budget'>;

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

export interface Indicator {
    id: number;
    fullTitle: string;
    abstract: string | undefined;
    category: string;

    unit?: string;
    datatype?: 'float' | 'integer';
}
