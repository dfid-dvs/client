import React, { useState } from 'react';
import {
    NavLink,
    useLocation,
} from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { IoIosSearch } from 'react-icons/io';

import SegmentInput from '#components/SegmentInput';
import TextInput from '#components/TextInput';
import DropdownMenu from '#components/DropdownMenu';
import NavbarContext from '#components/NavbarContext';
import {
    ExploreOption,
    RegionLevelOption,
    NavbarContextProps,
} from '#types';

import dfidLogo from './DfID-logo.svg';
import styles from './styles.css';

interface Props {
    className?: string;
}

interface ExploreOptionListItem {
    key: ExploreOption;
    label: string;
}

interface RegionLevelOptionListItem {
    key: RegionLevelOption;
    label: string;
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


const Navbar = (props: Props) => {
    const { className } = props;
    const [values, setValues] = useState({
        exploreBy: 'programs',
        searchProgram: '',
    });

    const {
        exploreBy,
        setExploreBy,
        regionLevel,
        setRegionLevel,
    } = React.useContext<NavbarContextProps>(NavbarContext);

    const location = useLocation();
    const isCovidPage = location.pathname === '/covid19/';

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
                        <SegmentInput
                            className={styles.regionLevelSelection}
                            label="Level"
                            options={regionLevelOptionList}
                            optionKeySelector={regionLevelOptionListKeySelector}
                            optionLabelSelector={regionLevelOptionListLabelSelector}
                            value={regionLevel}
                            onChange={setRegionLevel}
                        />
                    )}
                    {/*
                    <TextInput
                        icons={<IoIosSearch />}
                        className={styles.programSearch}
                    />
                    */}
                    {/* (!isCovidPage && exploreBy === 'programs') && (
                        <>
                            <DropdownMenu label="Sectors">
                                Choose sectors
                            </DropdownMenu>
                            <DropdownMenu label="Markers">
                                Select markers
                            </DropdownMenu>
                        </>
                    ) */}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
