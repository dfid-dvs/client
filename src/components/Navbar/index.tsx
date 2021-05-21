import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { RiAdminLine } from 'react-icons/ri';
import { IoMdArrowDropdown } from 'react-icons/io';

import Button from '#components/Button';
import DropdownMenu from '#components/DropdownMenu';

import { apiEndPoint } from '#utils/constants';

import useBasicToggle from '#hooks/useBasicToggle';

import navBarLogo from '#resources/ukaid-navbar-logo.jpg';
import useRequest from '#hooks/useRequest';
import { MultiResponse } from '#types';

import styles from './styles.css';

interface Props {
    className?: string;
    onLogout: () => void;
    administrator?: boolean;
}

interface UrlOptions {
    id: number;
    title: string;
    url: string;
}

const Navbar = (props: Props) => {
    const {
        className,
        onLogout,
        administrator,
    } = props;

    const link = process.env.REACT_APP_SERVER_URL || 'https://dvsnaxa.naxa.com.np/';

    const urlOptionsUrl = `${apiEndPoint}/core/national-statistic/`;

    const [
        urlOptionsPending,
        urlOptionsResponse,
    ] = useRequest<MultiResponse<UrlOptions>>(urlOptionsUrl, 'navbar-url-options');

    const urlOption = urlOptionsResponse?.results[0];

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
                {!urlOptionsPending && urlOption && (
                    <a
                        className={styles.adminConsoleLink}
                        href="/national-statistics/"
                        rel="noreferrer noopener"
                        target="_blank"
                    >
                        {urlOption.title}
                    </a>
                )}
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
                    className={styles.logout}
                >
                    Logout
                </Button>
            </div>
        </nav>
    );
};

export default Navbar;
