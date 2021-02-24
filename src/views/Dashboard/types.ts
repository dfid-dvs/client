export interface OriginalFiveW {
    id: number;
    name: string;

    // FIXME: should have different typings for different levels
    provinceName?: string;
    districtName?: string;

    code: string;
    allocatedBudget: number; // this may be undefined
    component: string[];
    partner: string[];
    sector: string[];
    subSector: string[];
    program: string[];
    // markerCategory: string[];
    // markerValue: string[];
}

export interface FiveW extends OriginalFiveW {
    partnerCount: number;
    componentCount: number;
    sectorCount: number;
    programCount: number;
}

export type FiveWOptionKey = Extract<keyof FiveW, 'allocatedBudget' | 'partnerCount' | 'componentCount' | 'sectorCount' | 'programCount'>;

export function isFiveWOptionKey(value: string): value is FiveWOptionKey {
    const options: FiveWOptionKey[] = [
        'allocatedBudget',
        'partnerCount',
        'componentCount',
        'sectorCount',
        'programCount',
    ];
    return options.includes(value as FiveWOptionKey);
}

export interface FiveWOption {
    key: string;
    label: string;
    datatype?: 'integer' | 'float';
    unit?: string;
}
