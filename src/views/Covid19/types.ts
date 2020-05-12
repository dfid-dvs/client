import { MapStateItem } from '#types';

export type AgeGroupOption = 'belowFourteen' | 'fifteenToFourtyNine' | 'aboveFifty';

export interface Attribute {
    key: 'indicator' | 'fiveW';
    label: string;
}

export interface FiveWOption {
    key: CovidFiveWOptionKey;
    label: string;
    datatype?: 'float' | 'integer';
    unit?: string;
}

export interface AgeGroup {
    key: AgeGroupOption;
    label: string;
    tooltipLabel: string;
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

export interface MapStateFiveWData extends MapStateItem {
    data?: CovidFiveW[];
}

export interface FiveWTooltipData {
    id: number;
    data?: CovidFiveW[];
}

export interface FiveW {
    id: number;
    name: string;
    code: string;
    allocatedBudget: number;
    maleBeneficiary: number;
    femaleBeneficiary: number;
    totalBeneficiary: number;
}

export interface CovidFiveW {
    id: number;
    provinceCode?: string;
    districtCode?: string;
    municipalityCode?: string;
    component: string;
    secondTierPartner: string;
    projectStatus: string;
    sector: string;
    budget: number;
    kathmanduActivity: string;
    deliveryInLockdown: string;
    covidPriority_3_12_Months: string;
    covidRecoveryPriority: string;
    providingTaToLocalGovernment: string;
}

export type FiveWOptionKey = Extract<keyof FiveW, 'allocatedBudget' | 'maleBeneficiary' | 'femaleBeneficiary' | 'totalBeneficiary'>;

export type CovidFiveWOptionKey = Extract<keyof CovidFiveW, 'component' | 'sector'>;

export type CovidFiveWRegionKey = Extract<keyof CovidFiveW, 'provinceCode' | 'districtCode' | 'municipalityCode'>;
