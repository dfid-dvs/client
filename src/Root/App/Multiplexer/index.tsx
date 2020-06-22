import React, { Suspense, useEffect, useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import Navbar from '#components/Navbar';
import DomainContext from '#components/DomainContext';
import NavbarContext from '#components/NavbarContext';
import {
    RegionLevelOption,
    DomainContextProps,
    NavbarContextProps,
} from '#types';

import routes from './routes';
import styles from './styles.css';

interface TitleProps {
    value: string;
}
function Title({ value }: TitleProps) {
    useEffect(
        () => {
            document.title = value;
        },
        [value],
    );
    return null;
}

interface LoadingProps {
    message: string;
}
function Loading({ message }: LoadingProps) {
    return (
        <div className={styles.loading}>
            {message}
        </div>
    );
}

interface Props {
    className?: string;
}
function Multiplexer(props: Props) {
    const { className } = props;

    const [regionLevel, setRegionLevel] = React.useState<RegionLevelOption>('province');
    const [programs, setPrograms] = React.useState<number[]>([]);
    const [covidMode, setCovidMode] = React.useState(false);

    const domainContextProvider: DomainContextProps = {
        regionLevel,
        setRegionLevel,
        covidMode,
        setCovidMode,
        programs,
        setPrograms,
    };

    const [parentNode, setParentNode] = useState<HTMLDivElement | null | undefined>();

    const navbarContextProvider: NavbarContextProps = {
        parentNode,
        setParentNode,
    };

    return (
        <div className={_cs(className, styles.multiplexer)}>
            <NavbarContext.Provider value={navbarContextProvider}>
                <Navbar className={styles.navbar} />
                <DomainContext.Provider value={domainContextProvider}>
                    <Suspense
                        fallback={(
                            <Loading message="Please wait..." />
                        )}
                    >
                        <Switch>
                            {routes.map((route) => {
                                const {
                                    path,
                                    name,
                                    title,
                                    // hideNavbar,
                                    load: Loader,
                                } = route;

                                return (
                                    <Route
                                        exact
                                        className={styles.route}
                                        key={name}
                                        path={path}
                                        render={() => (
                                            <>
                                                <Title value={title} />
                                                <Loader className={styles.view} />
                                            </>
                                        )}
                                    />
                                );
                            })}
                        </Switch>
                    </Suspense>
                </DomainContext.Provider>
            </NavbarContext.Provider>
        </div>
    );
}
export default Multiplexer;
