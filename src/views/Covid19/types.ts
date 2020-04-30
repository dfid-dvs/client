import { AgeGroupOption, CovidFiveWOptionKey } from '#types';

export interface Attribute {
    key: 'indicator' | 'fiveW';
    label: string;
}

export interface FiveWOption {
    key: CovidFiveWOptionKey;
    label: string;
    integer: boolean;
}

// FIXME: use from typings
export interface Indicator {
    id: number;
    fullTitle: string;
    abstract: string | undefined;
    category: string;
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
