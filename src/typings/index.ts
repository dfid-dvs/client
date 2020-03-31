export interface InputChangeEvent<T=string|undefined> {
    value: T;
    name: string | undefined;
    originalEvent?: React.FormEvent<HTMLInputElement>;
}

export interface ButtonClickEvent {
    name: string | undefined;
    originalEvent: React.MouseEvent<HTMLButtonElement>;
}

export type ExploreOption = 'programs' | 'regions';
export type RegionLevelOption = 'province' | 'district' | 'municipality';


export interface NavbarContextProps {
    exploreBy: ExploreOption;
    setExploreBy: (v: ExploreOption) => void;
    regionLevel: RegionLevelOption;
    setRegionLevel: (v: RegionLevelOption) => void;
}
