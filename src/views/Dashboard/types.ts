export interface FiveW {
    id: number;
    name: string;
    code: string;
    allocatedBudget: number;
    maleBeneficiary: number;
    femaleBeneficiary: number;
    totalBeneficiary: number;
}

export type FiveWOptionKey = Extract<keyof FiveW, 'allocatedBudget' | 'maleBeneficiary' | 'femaleBeneficiary' | 'totalBeneficiary'>;

export interface FiveWOption {
    key: FiveWOptionKey;
    label: string;
    datatype?: 'integer' | 'float';
    unit?: string;
}
