import React from 'react';
import { NavLink } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import SegmentInput from '#components/SegmentInput';

import styles from './styles.css';

interface Props {
    className?: string;
}

const Navbar = (props: Props) => {
    const { className } = props;

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
                        label="Explore"
                        options={[
                            { key: 'programs', label: 'Programs' },
                            { key: 'regions', label: 'Regions' },
                        ]}
                        optionKeySelector={d => d.key}
                        optionLabelSelector={d => d.label}
                        value="regions"
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
