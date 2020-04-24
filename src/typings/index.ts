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

export type FiveWOptionKey = 'allocatedBudget' | 'maleBeneficiary' | 'femaleBeneficiary' | 'totalBeneficiary';
