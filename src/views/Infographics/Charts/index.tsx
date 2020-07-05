import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
}

function InfographicsCharts(props: Props) {
    const { className } = props;

    return (
        <div className={_cs(styles.charts, className)}>
            Charts
        </div>
    );
}

export default InfographicsCharts;
