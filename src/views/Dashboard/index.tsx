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
            Dashboard
            <Button>
                button
            </Button>
        </div>
    );
};

export default Dashboard;
