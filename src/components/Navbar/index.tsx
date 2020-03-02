import React from 'react';
import { NavLink } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

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
            <div className={styles.navLinks}>
                <NavLink
                    exact
                    className={styles.link}
                    activeClassName={styles.active}
                    to="/"
                >
                    Home
                </NavLink>
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
                    to="/glossary/"
                    className={styles.link}
                    activeClassName={styles.active}
                >
                    Glossary
                </NavLink>
            </div>
        </nav>
    );
};

export default Navbar;
