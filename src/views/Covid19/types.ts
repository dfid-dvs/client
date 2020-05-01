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

export type CovidFiveWOptionKey = Extract<keyof CovidFiveW, 'projectName' | 'sector'>;

export type CovidFiveWRegionKey = Extract<keyof CovidFiveW, 'provinceCode' | 'districtCode' | 'municipalityCode'>;
