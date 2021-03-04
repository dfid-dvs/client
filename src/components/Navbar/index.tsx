import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { RiAdminLine } from 'react-icons/ri';
import { IoMdArrowDropdown } from 'react-icons/io';

import Button from '#components/Button';
import DropdownMenu from '#components/DropdownMenu';

import dfidLogo from '#resources/dfid-off-logo.jpg';
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
        <nav
            className={_cs(className, styles.navbar)}
            id="main-navbar"
        >
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
                    <DropdownMenu
                        className={styles.exploreDataButton}
                        dropdownContainerClassName={styles.exploreDataContainer}
                        label={(
                            <>
                                <div className={styles.title}>
                                    Explore Data
                                </div>
                                <IoMdArrowDropdown className={styles.icon} />
                            </>
                        )}
                    >

                        <Link
                            className={styles.link}
                            to="/#regions"
                            replace
                        >
                            By Region
                        </Link>
                        <Link
                            className={_cs(styles.link, styles.disabled)}
                            to="/#programs"
                            replace
                        >
                            By Program
                        </Link>
                    </DropdownMenu>
                    {/*
                    <NavLink
                        exact
                        className={styles.link}
                        activeClassName={styles.active}
                        to="/output/"
                    >
                        Output
                    </NavLink>
                      */}
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
            <div className={styles.userActions}>
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
                <Button onClick={onLogout}>
                    Logout
                </Button>
            </div>
        </nav>
    );
};

export default Navbar;
