import React, { Suspense, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import Navbar from '#components/Navbar';
import NavbarContext from '#components/NavbarContext';
import {
    ExploreOption,
    RegionLevelOption,
    NavbarContextProps,
} from '#types';

import routes from './routes';
import styles from './styles.css';

interface TitleProps {
    value: string;
}
const Title = ({ value }: TitleProps) => {
    useEffect(
        () => {
            document.title = value;
        },
        [value],
    );
    return null;
};

interface LoadingProps {
    message: string;
}
const Loading = ({ message }: LoadingProps) => (
    <div className={styles.loading}>
        {message}
    </div>
);

interface Props {
    className?: string;
}

function Multiplexer(props: Props) {
    const { className } = props;
    const [exploreBy, setExploreBy] = React.useState<ExploreOption>('programs');
    const [regionLevel, setRegionLevel] = React.useState<RegionLevelOption>('province');

    const navbarContextProvider: NavbarContextProps = {
        exploreBy,
        setExploreBy,
        regionLevel,
        setRegionLevel,
    };

    return (
        <div className={_cs(className, styles.multiplexer)}>
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
                                        <Loader className={styles.view} />
                                    </NavbarContext.Provider>
                                )}
                            />
                        );
                    })}
                </Switch>
            </Suspense>
        </div>
    );
}
export default Multiplexer;
