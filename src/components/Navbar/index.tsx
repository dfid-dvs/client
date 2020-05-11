import React from 'react';
import {
    NavLink,
    useLocation,
} from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import ProgramSelector from '#components/ProgramSelector';

import dfidLogo from '#resources/DfID-logo.svg';
import styles from './styles.css';

interface Props {
    className?: string;
}

const Navbar = (props: Props) => {
    const { className } = props;

    const location = useLocation();
    const isCovidPage = location.pathname === '/covid19/';

    return (
        <nav className={_cs(className, styles.navbar)}>
            <div className={styles.appBrand}>
                <img
                    className={styles.logo}
                    src={dfidLogo}
                    alt="DFID"
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
                    <NavLink
                        exact
                        className={styles.link}
                        activeClassName={styles.active}
                        to="/glossary/"
                    >
                        Glossary
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
                    {!isCovidPage && (
                        <ProgramSelector
                            className={styles.programSelector}
                        />
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
