import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Numeral from '#components/Numeral';

import styles from './styles.css';

function StatItem({
    label,
    value,
    className,
}: {
    label: string;
    value: number | undefined;
    className?: string;
}) {
    return (
        <div className={_cs(styles.statItem, className)}>
            <Numeral
                className={styles.value}
                value={value}
                normalize
                placeholder="-"
            />
            <div className={styles.label}>
                { label }
            </div>
        </div>
    );
}

export default StatItem;
