import React, { Suspense } from 'react';
import { Switch, Route } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import Navbar from '#components/Navbar';
import routeSettings from '#constants/routeSettings';

import styles from './styles.css';

interface Props {
    className?: string;
}

const Loading = () => <div className={styles.loading}>Loading...</div>;

const Multiplexer = (props: Props) => {
    const { className } = props;

    return (
        <div className={_cs(className, styles.multiplexer)}>
            <Suspense fallback={<Loading />}>
                <Switch>
                    { routeSettings.map(routeDetails => (
                        <Route
                            exact
                            className={styles.route}
                            key={routeDetails.name}
                            path={routeDetails.path}
                            render={() => {
                                document.title = routeDetails.title;

                                return (
                                    <>
                                        { !routeDetails.hideNavbar && (
                                            <Navbar className={styles.navbar} />
                                        )}
                                        <routeDetails.load className={styles.view} />
                                    </>
                                );
                            }}
                        />
                    ))}
                </Switch>
            </Suspense>
        </div>
    );
};

export default Multiplexer;
