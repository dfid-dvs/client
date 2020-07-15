import React, { useEffect, useRef, useContext } from 'react';
import ReactDOM from 'react-dom';
import { NavLink } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { RiAdminLine } from 'react-icons/ri';

import NavbarContext from '#components/NavbarContext';
import Button from '#components/Button';
import { NavbarContextProps } from '#types';

import dfidLogo from '#resources/DfID-logo.svg';
import styles from './styles.css';


interface ChildProps {
    children: React.ReactNode;
}
export const SubNavbar = ({ children }: ChildProps) => {
    const { parentNode } = useContext<NavbarContextProps>(NavbarContext);
    if (!parentNode) {
        return null;
    }
    return ReactDOM.createPortal(children, parentNode);
};

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

    const filterRef = useRef<HTMLDivElement>(null);

    const { setParentNode } = useContext<NavbarContextProps>(NavbarContext);

    useEffect(
        () => {
            setParentNode(filterRef.current);
        },
        [setParentNode],
    );

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
                        to="/dashboard/"
                    >
                        Dashboard
                    </NavLink>
                </div>
                <div
                    className={styles.filters}
                    ref={filterRef}
                />
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
