import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Numeral from '#components/Numeral';
import styles from './styles.css';

export default function ProgramStat(props: {
    label: string;
    value: number | string;
    className?: string;
    isDate?: boolean;
}) {
    const {
        label,
        value,
        className,
        isDate = false,
    } = props;

    const statValue = !isDate ? value : new Date(value).toLocaleDateString();

    return (
        <div className={_cs(styles.statOutput, className)}>
            <div className={styles.label}>
                { label }
            </div>
            {isDate && (
                <div className={styles.value}>
                    {statValue}
                </div>
            )}
            {!isDate && (
                <Numeral
                    className={styles.value}
                    value={+value}
                    normalize
                />
            )}
        </div>
    );
}
