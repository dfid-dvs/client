import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { IoIosSearch } from 'react-icons/io';

import SegmentInput from '#components/SegmentInput';
import TextInput from '#components/TextInput';
import DropdownMenu from '#components/DropdownMenu';
import { useForm } from '#hooks';

import styles from './styles.css';


interface Props {
    className?: string;
}

type ExploreOptions = 'programs' | 'regions';


const Navbar = (props: Props) => {
    const { className } = props;
    const [values, setValues] = useState({
        exploreBy: 'programs',
        searchProgram: '',
    });
    const { formElement } = useForm(values, setValues);

    return (
        <nav className={_cs(className, styles.navbar)}>
            <div className={styles.appBrand}>
                DFID
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
                </div>
                <div className={styles.filters}>
                    <SegmentInput
                        className={styles.exploreBySelection}
                        label="Explore by"
                        options={[
                            { key: 'programs', label: 'Programs' },
                            { key: 'regions', label: 'Regions' },
                        ]}
                        optionKeySelector={d => d.key}
                        optionLabelSelector={d => d.label}
                        {...formElement('exploreBy')}
                    />
                    <TextInput
                        icons={<IoIosSearch />}
                        className={styles.programSearch}
                        {...formElement('searchProgram')}
                    />
                    <DropdownMenu label="Sectors">
                        Choose sectors
                    </DropdownMenu>
                    <DropdownMenu label="Markers">
                        Select markers
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
