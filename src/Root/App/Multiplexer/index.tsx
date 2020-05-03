import React, { Suspense, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import ErrorBoundary from '#components/ErrorBoundary';
import Navbar from '#components/Navbar';
import NavbarContext from '#components/NavbarContext';
import {
    RegionLevelOption,
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

    const navbarContextProvider: NavbarContextProps = {
        regionLevel,
        setRegionLevel,
    };

    return (
        <div className={_cs(className, styles.multiplexer)}>
            <ErrorBoundary>
                <Suspense fallback={(
                    <Loading message="Please wait..." />
                )}
                >
                    <Switch>
                        {routes.map((route) => {
                            const {
                                path,
                                name,
                                title,
                                hideNavbar,
                                load: Loader,
                            } = route;

                            return (
                                <Route
                                    exact
                                    className={styles.route}
                                    key={name}
                                    path={path}
                                    render={() => (
                                        <NavbarContext.Provider value={navbarContextProvider}>
                                            <Title value={title} />
                                            { !hideNavbar && (
                                                <Navbar className={styles.navbar} />
                                            )}
                                            <ErrorBoundary>
                                                <Loader className={styles.view} />
                                            </ErrorBoundary>
                                        </NavbarContext.Provider>
                                    )}
                                />
                            );
                        })}
                    </Switch>
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
export default Multiplexer;
