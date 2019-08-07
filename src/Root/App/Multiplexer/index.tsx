import Loadable from 'react-loadable';
import React from 'react';
import { Router } from '@reach/router';
import { _cs } from '@togglecorp/fujs';

import DangerButton from '#rsca/Button/DangerButton';

import Loading from '#components/Loading';
import Navbar from '#components/Navbar';
import errorBound from '#components/errorBound';
import helmetify from '#components/helmetify';

import { routeSettings } from '#constants';
import styles from './styles.scss';

interface LoadOptions {
    error: string;
    retry: () => void;
}

function reloadPage(): void {
    window.location.reload(false);
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const ErrorInPage = () => (
    <div className={styles.pageError}>
        <div className={styles.message}>
            Some problem occured.
        </div>
        <DangerButton
            className={styles.reloadButton}
            transparent
            onClick={reloadPage}
        >
            Reload
        </DangerButton>
    </div>
);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const RetryableErrorInPage = ({ error, retry }: LoadOptions) => {
    console.error(error);
    return (
        <div className={styles.retryablePageError}>
            <div className={styles.message}>
                Some problem occured.
            </div>
            <DangerButton
                className={styles.reloadButton}
                onClick={retry}
                transparent
            >
                Reload
            </DangerButton>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const LoadingPage = ({ error, retry }: LoadOptions) => {
    if (error) {
        return (
            <RetryableErrorInPage
                error={error}
                retry={retry}
            />
        );
    }

    return (
        <Loading
            className={styles.loading}
            text="Loading Page"
            pending
        />
    );
};

const routes = routeSettings.map(({ load, ...settings }) => {
    const Component = errorBound<typeof settings>(ErrorInPage)(
        helmetify(
            Loadable({
                loader: load,
                loading: LoadingPage,
            }),
        ),
    );

    return (
        <Component
            key={settings.name}
            {...settings}
        />
    );
});

interface State {
}
interface Props {
    pending: boolean;
    className?: string;
}

class Multiplexer extends React.PureComponent<Props, State> {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    private renderRoutes = () => {
        const { pending } = this.props;
        if (pending) {
            return (
                <Loading
                    text="Loading Resources"
                    pending
                />
            );
        }

        return (
            <Router className={styles.router}>
                {routes}
            </Router>
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    public render() {
        const { className } = this.props;

        return (
            <div className={_cs(styles.multiplexer, className, 'multiplexer')}>
                <Navbar className={styles.navbar} />
                <div className={_cs(styles.appMainContent, 'app-main-content')}>
                    {this.renderRoutes()}
                </div>
            </div>
        );
    }
}

export default Multiplexer;
