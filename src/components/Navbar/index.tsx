import React, { useEffect, useRef, useContext } from 'react';
import ReactDOM from 'react-dom';
import { NavLink } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import NavbarContext from '#components/NavbarContext';
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
}

const Navbar = (props: Props) => {
    const { className } = props;

    const filterRef = useRef<HTMLDivElement>(null);

    const { setParentNode } = useContext<NavbarContextProps>(NavbarContext);

    useEffect(
        () => {
            setParentNode(filterRef.current);
        },
        [setParentNode],
    );

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
                    {/*
                    <NavLink
                        exact
                        to="/infographics/"
                        className={styles.link}
                        activeClassName={styles.active}
                    >
                        Infographics
                    </NavLink>
                    */}
                </div>
                <div
                    className={styles.filters}
                    ref={filterRef}
                />
            </div>
        </nav>
    );
};

export default Navbar;
