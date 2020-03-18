import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import SegmentInput from '#components/SegmentInput';
import { useForm } from '#hooks';

import styles from './styles.css';


interface Props {
    className?: string;
}

type ExploreOptions = 'programs' | 'regions';


const Navbar = (props: Props) => {
    const { className } = props;
    const [values, setValues] = useState({ exploreBy: 'programs' });
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
                        label="Explore by"
                        options={[
                            { key: 'programs', label: 'Programs' },
                            { key: 'regions', label: 'Regions' },
                        ]}
                        optionKeySelector={d => d.key}
                        optionLabelSelector={d => d.label}
                        {...formElement('exploreBy')}
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
