export interface OriginalFiveW {
    id: number;
    name: string;
    code: string;
    allocatedBudget: number; // this may be undefined
    component: string[];
    partner: string[];
    sector: string[];
    subSector: string[];
    // markerCategory: string[];
    // markerValue: string[];
}

export interface FiveW extends OriginalFiveW {
    partnerCount: number;
    componentCount: number;
    sectorCount: number;
}

export type FiveWOptionKey = Extract<keyof FiveW, 'allocatedBudget' | 'partnerCount' | 'componentCount' | 'sectorCount'>;

export interface FiveWOption {
    key: FiveWOptionKey;
    label: string;
    datatype?: 'integer' | 'float';
    unit?: string;
}

export interface HospitalType {
    key: 'deshosp' | 'allcovidhfs';
    label: string;
}

export interface Season {
    key: 'msn' | 'dry';
    label: string;
}

export interface TravelTimeType {
    key: 'catchment' | 'uncovered';
    label: string;
}
