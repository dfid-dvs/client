import React from 'react';
import { NavLink } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { RiAdminLine } from 'react-icons/ri';

import Button from '#components/Button';

import dfidLogo from '#resources/dfid-crown.png';
import styles from './styles.css';

interface Props {
    className?: string;
    onLogout: () => void;
    administrator?: boolean;
}

const Navbar = (props: Props) => {
    const {
        className,
        onLogout,
        administrator,
    } = props;

    const link = process.env.REACT_APP_SERVER_URL || 'https://dvsnaxa.naxa.com.np/';

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
                        to="/"
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        exact
                        className={styles.link}
                        activeClassName={styles.active}
                        to="/output/"
                    >
                        Output
                    </NavLink>
                    <NavLink
                        exact
                        className={styles.link}
                        activeClassName={styles.active}
                        to="/about/"
                    >
                        About
                    </NavLink>
                </div>
            </div>
            {administrator && (
                <a
                    className={styles.adminConsoleLink}
                    href={link}
                    rel="noreferrer noopener"
                    target="_blank"
                >
                    <RiAdminLine className={styles.adminIcon} />
                    Admin Panel
                </a>
            )}
            <Button
                onClick={onLogout}
            >
                Logout
            </Button>
        </nav>
    );
};

export default Navbar;
