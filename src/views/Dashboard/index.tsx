import React from 'react';
import { _cs } from '@togglecorp/fujs';

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
        </div>
    );
};

export default Dashboard;
