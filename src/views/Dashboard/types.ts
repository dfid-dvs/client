export interface FiveW {
    id: number;
    name: string;
    code: string;
    allocatedBudget: number;
}

export type FiveWOptionKey = Extract<keyof FiveW, 'allocatedBudget'>;

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
