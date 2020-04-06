import React, { useState } from 'react';
import {
    NavLink,
    useLocation,
} from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { IoIosSearch } from 'react-icons/io';

import SegmentInput from '#components/SegmentInput';
import SelectInput from '#components/SelectInput';
import DropdownMenu from '#components/DropdownMenu';
import NavbarContext from '#components/NavbarContext';
import TreeInput from '#components/TreeInput';

import {
    ExploreOption,
    RegionLevelOption,
    NavbarContextProps,
} from '#types';
import {
    useRequest,
} from '#hooks';

import {
    apiEndPoint,
} from '#utils/constants';

import dfidLogo from './DfID-logo.svg';
import styles from './styles.css';

interface Props {
    className?: string;
}

interface TreeItem {
    key: string;
    id: number;
    parentKey: string | undefined;
    parentId: number | undefined;
    name: string;
}

interface ExploreOptionListItem {
    key: ExploreOption;
    label: string;
}

interface RegionLevelOptionListItem {
    key: RegionLevelOption;
    label: string;
}

interface Region {
    id: number;
    name: string;
}

interface Province {
    id: number;
    name: string;
    code: string;
    boundary: string;
}
interface District {
    id: number;
    provinceId: number;
    provinceName: string;
    name: string;
    code: string;
    nCode: number;
}

interface Municipality {
    id: number;
    name: string;
    provinceId: number;
    districtId: number;
    hlcitCode: string;
    gnTypeNp: string;
    code: string;
    population: number;
}

interface Sector {
    id: number;
    name: string;
}

interface SubSector {
    id: number;
    sectorId: number;
    sectorName: string;
    name: string;
    code: string;
}

interface Marker {
    id: number;
    name: string;
}

interface SubMarker {
    id: number;
    value: string;
    markerCategoryId: number;
    markerCategory: string;
}

interface Program {
    id: number;
    name: string;
    description: string;
    sector: number[];
    subSector: number[];
    markerCategory: number[];
    markerValue: number[];
    partner: number[];
    code: number;
    budget: number;
}

const exploreOptionList: ExploreOptionListItem[] = [
    { key: 'programs', label: 'Programs' },
    { key: 'regions', label: 'Regions' },
];

const exploreOptionListKeySelector = (d: ExploreOptionListItem) => d.key;
const exploreOptionListLabelSelector = (d: ExploreOptionListItem) => d.label;

const regionLevelOptionList: RegionLevelOptionListItem[] = [
    { key: 'province', label: 'Province' },
    { key: 'district', label: 'District' },
    { key: 'municipality', label: 'Municipality' },
];

const regionLevelOptionListKeySelector = (d: RegionLevelOptionListItem) => d.key;
const regionLevelOptionListLabelSelector = (d: RegionLevelOptionListItem) => d.label;

const treeKeySelector = (item: TreeItem) => item.key;
const treeParentSelector = (item: TreeItem) => item.parentKey;
const treeLabelSelector = (item: TreeItem) => item.name;

const Navbar = (props: Props) => {
    const { className } = props;
    const [values, setValues] = useState({
        exploreBy: 'programs',
        searchProgram: '',
    });
    const [
        selectedRegion,
        setSelectedRegion,
    ] = React.useState<number | undefined>(undefined);

    const [
        selectedProgram,
        setSelectedProgram,
    ] = React.useState<number | undefined>(undefined);

    const [
        selectedSector,
        setSelectedSector,
    ] = React.useState<string[] | undefined>(undefined);
    const [
        selectedMarker,
        setSelectedMarker,
    ] = React.useState<string[] | undefined>(undefined);

    const provinceGetRequest = `${apiEndPoint}/province/`;
    const [
        provinceListPending,
        provinceListResponse,
    ] = useRequest<Province>(provinceGetRequest);

    const districtGetRequest = `${apiEndPoint}/district/`;
    const [
        districtListPending,
        districtListResponse,
    ] = useRequest<District>(districtGetRequest);

    const municipalityGetRequest = `${apiEndPoint}/gapanapa/`;
    const [
        municipalityListPending,
        municipalityListResponse,
    ] = useRequest<Municipality>(municipalityGetRequest);

    const sectorGetRequest = `${apiEndPoint}/sector/`;
    const [
        sectorListPending,
        sectorListResponse,
    ] = useRequest<Sector>(sectorGetRequest);

    const subSectorGetRequest = `${apiEndPoint}/sub-sector/`;
    const [
        subSectorListPending,
        subSectorListResponse,
    ] = useRequest<SubSector>(subSectorGetRequest);

    const markerGetRequest = `${apiEndPoint}/marker-category/`;
    const [
        markerListPending,
        markerListResponse,
    ] = useRequest<Marker>(markerGetRequest);

    const subMarkerGetRequest = `${apiEndPoint}/marker-value/`;
    const [
        subMarkerListPending,
        subMarkerListResponse,
    ] = useRequest<SubMarker>(subMarkerGetRequest);

    const programListGetUrl = `${apiEndPoint}/program/`;
    const [
        programListPending,
        programListResponse,
    ] = useRequest<Program>(programListGetUrl);

    const {
        exploreBy,
        setExploreBy,
        regionLevel,
        setRegionLevel,
    } = React.useContext<NavbarContextProps>(NavbarContext);

    const location = useLocation();
    const isCovidPage = location.pathname === '/covid19/';
    const regionLevelLabel = regionLevelOptionList.find(v => v.key === regionLevel)?.label;

    const sectorOptions: TreeItem[] = sectorListResponse.results.map(({ id, name }) => ({
        key: `sector-${id}`,
        parentKey: undefined,
        parentId: undefined,
        name,
        id,
    }));
    const subSectorOptions: TreeItem[] = subSectorListResponse.results.map(
        ({ id, sectorId, name }) => ({
            key: `subsector-${sectorId}-${id}`,
            parentKey: `sector-${sectorId}`,
            parentId: sectorId,
            name,
            id,
        }),
    );

    const combinedSectorOptions = [...sectorOptions, ...subSectorOptions];

    const markerOptions: TreeItem[] = markerListResponse.results.map(({ id, name }) => ({
        key: `marker-${id}`,
        parentKey: undefined,
        parentId: undefined,
        name,
        id,
    }));

    const subMarkerOptions: TreeItem[] = subMarkerListResponse.results.map(
        ({ id, markerCategoryId, value }) => ({
            key: `submarker-${markerCategoryId}-${id}`,
            parentKey: `marker-${markerCategoryId}`,
            parentId: markerCategoryId,
            name: value,
            id,
        }),
    );

    const combinedMarkerOptions = [...markerOptions, ...subMarkerOptions];

    const regionPending = provinceListPending || districtListPending || municipalityListPending;

    let regionOptions: Region[] = provinceListResponse.results;
    if (regionLevel === 'district') {
        regionOptions = districtListResponse.results;
    }
    if (regionLevel === 'municipality') {
        regionOptions = municipalityListResponse.results;
    }

    return (
        <nav className={_cs(className, styles.navbar)}>
            <div className={styles.appBrand}>
                <img
                    className={styles.logo}
                    src={dfidLogo}
                    alt="DfID"
                />
            </div>
            <div className={styles.actions}>
                <div className={styles.navLinks}>
                    <NavLink
                        exact
                        className={styles.link}
                        activeClassName={styles.active}
                        to="/dashboard/"
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        exact
                        className={styles.link}
                        activeClassName={styles.active}
                        to="/covid19/"
                    >
                        COVID-19
                    </NavLink>
                    {/*
                        <NavLink
                        exact
                        to="/infographics/"
                        className={styles.link}
                        activeClassName={styles.active}
                        >
                        Infographics
                        </NavLink>
                        <NavLink
                        exact
                        to="/analytical-tools/"
                        className={styles.link}
                        activeClassName={styles.active}
                        >
                        Analytical tools
                        </NavLink>
                      */}
                </div>
                <div className={styles.filters}>
                    { !isCovidPage && (
                        <SegmentInput
                            className={styles.exploreBySelection}
                            label="Explore by"
                            options={exploreOptionList}
                            optionKeySelector={exploreOptionListKeySelector}
                            optionLabelSelector={exploreOptionListLabelSelector}
                            value={exploreBy}
                            onChange={setExploreBy}
                        />
                    )}
                    {exploreBy === 'regions' && (
                        <>
                            <SegmentInput
                                className={styles.regionLevelSelection}
                                label="Level"
                                options={regionLevelOptionList}
                                optionKeySelector={regionLevelOptionListKeySelector}
                                optionLabelSelector={regionLevelOptionListLabelSelector}
                                value={regionLevel}
                                onChange={setRegionLevel}
                            />
                            <SelectInput
                                placeholder={`Select ${regionLevelLabel}`}
                                className={styles.regionSelectInput}
                                disabled={regionPending}
                                options={regionOptions}
                                onChange={setSelectedRegion}
                                value={selectedRegion}
                                optionLabelSelector={d => d.name}
                                optionKeySelector={d => d.id}
                            />
                        </>
                    )}
                    {(!isCovidPage && exploreBy === 'programs') && (
                        <>
                            <SelectInput
                                placeholder="Select an indicator"
                                className={styles.indicatorSelectInput}
                                disabled={programListPending}
                                options={programListResponse.results}
                                onChange={setSelectedProgram}
                                value={selectedProgram}
                                optionLabelSelector={d => d.name}
                                optionKeySelector={d => d.id}
                            />
                            <DropdownMenu label="Sectors">
                                <TreeInput
                                    className={styles.sectorTree}
                                    label="Sector"
                                    keySelector={treeKeySelector}
                                    parentKeySelector={treeParentSelector}
                                    labelSelector={treeLabelSelector}
                                    options={combinedSectorOptions}
                                    value={selectedSector}
                                    onChange={setSelectedSector}
                                    defaultCollapseLevel={0}
                                />
                            </DropdownMenu>
                            <DropdownMenu label="Markers">
                                <TreeInput
                                    className={styles.markerTree}
                                    label="Marker"
                                    keySelector={treeKeySelector}
                                    parentKeySelector={treeParentSelector}
                                    labelSelector={treeLabelSelector}
                                    options={combinedMarkerOptions}
                                    value={selectedMarker}
                                    onChange={setSelectedMarker}
                                    defaultCollapseLevel={0}
                                />
                            </DropdownMenu>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
