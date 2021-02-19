import React, { Suspense, useEffect, useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import { ErrorBoundary } from '@sentry/react';
import { _cs } from '@togglecorp/fujs';

import Navbar from '#components/Navbar';
import DomainContext from '#components/DomainContext';
import {
    RegionLevelOption,
    DomainContextProps,
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
    onLogout: () => void;
    administrator?: boolean;
}
function Multiplexer(props: Props) {
    const {
        className,
        onLogout,
        administrator,
    } = props;

    const [regionLevel, setRegionLevel] = React.useState<RegionLevelOption>('province');
    const [programs, setPrograms] = React.useState<number[]>([]);

    const domainContextProvider: DomainContextProps = {
        regionLevel,
        setRegionLevel,
        programs,
        setPrograms,
    };

    return (
        <div className={_cs(className, styles.multiplexer)}>
            <Navbar
                className={styles.navbar}
                onLogout={onLogout}
                administrator={administrator}
            />
            <ErrorBoundary
                fallback={(
                    <div className={styles.page}>
                        You have encountered an error!
                    </div>
                )}
                showDialog
            >
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
            </ErrorBoundary>
        </div>
    );
}
export default Multiplexer;
