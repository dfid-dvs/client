import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { RiAdminLine } from 'react-icons/ri';
import { IoMdArrowDropdown } from 'react-icons/io';

import Button from '#components/Button';
import DropdownMenu from '#components/DropdownMenu';
import useBasicToggle from '#hooks/useBasicToggle';

import navBarLogo from '#resources/ukaid-navbar-logo.jpg';
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

    const [
        dropdownShown, , , toggleDropdownShown,
    ] = useBasicToggle();

    return (
        <nav
            className={_cs(className, styles.navbar)}
            id="main-navbar"
        >
            <div className={styles.appBrand}>
                <img
                    className={styles.logo}
                    src={navBarLogo}
                    alt="British Embassy Kathmandu"
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
                        Overview
                    </NavLink>
                    <DropdownMenu
                        className={styles.exploreDataButton}
                        dropdownContainerClassName={_cs(
                            styles.exploreDataContainer,
                            !dropdownShown && styles.hidden,
                        )}
                        label={(
                            <div
                                role="presentation"
                                className={styles.label}
                                onClick={toggleDropdownShown}
                            >
                                <div className={styles.title}>
                                    Explore Data
                                </div>
                                <IoMdArrowDropdown
                                    className={styles.icon}
                                />
                            </div>
                        )}
                    >
                        {dropdownShown && (
                            <Link
                                className={styles.link}
                                to="/#regions"
                                replace
                                onClick={toggleDropdownShown}
                            >
                                By Regions
                            </Link>
                        )}
                        {dropdownShown && (
                            <Link
                                className={styles.link}
                                to="/#programs"
                                replace
                                onClick={toggleDropdownShown}
                            >
                                By Programs
                            </Link>
                        )}
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
