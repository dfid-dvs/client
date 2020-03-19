import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';

import styles from './styles.css';

interface Props {
    className?: string;
}

const Dashboard = (props: Props) => {
    const { className } = props;
    return (
        <div className={_cs(
            styles.dashboard,
            className,
        )}
        >
            <div>
                Dashboard
            </div>
            <div className={styles.buttons}>
                <Button
                    className={styles.button}
                    onClick={() => {
                        console.warn('clicked');
                    }}
                >
                    default
                </Button>
                <Button
                    variant="primary"
                    className={styles.button}
                    onClick={() => {
                        console.warn('clicked');
                    }}
                >
                    primary
                </Button>
                <Button
                    variant="accent"
                    className={styles.button}
                    onClick={() => {
                        console.warn('clicked');
                    }}
                >
                    accent
                </Button>
                <Button
                    variant="warning"
                    className={styles.button}
                    onClick={() => {
                        console.warn('clicked');
                    }}
                >
                    warning
                </Button>
                <Button
                    variant="danger"
                    className={styles.button}
                    onClick={() => {
                        console.warn('clicked');
                    }}
                >
                    danger
                </Button>
                <Button
                    variant="success"
                    className={styles.button}
                    onClick={() => {
                        console.warn('clicked');
                    }}
                >
                    success
                </Button>
            </div>
            <div className={styles.buttons}>
                <Button
                    className={styles.button}
                >
                    default
                </Button>
                <Button
                    variant="primary"
                    className={styles.button}
                >
                    primary
                </Button>
                <Button
                    variant="accent"
                    className={styles.button}
                >
                    accent
                </Button>
                <Button
                    variant="warning"
                    className={styles.button}
                >
                    warning
                </Button>
                <Button
                    variant="danger"
                    className={styles.button}
                >
                    danger
                </Button>
                <Button
                    variant="success"
                    className={styles.button}
                >
                    success
                </Button>
            </div>
        </div>
    );
};

export default Dashboard;
