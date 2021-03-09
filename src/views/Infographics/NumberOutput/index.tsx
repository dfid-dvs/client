import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Numeral from '#components/Numeral';
import styles from './styles.css';

export default function NumberOutput(p: {
    label: string;
    value: number;
    className?: string;
}) {
    const {
        label,
        value,
        className,
    } = p;

    return (
        <div className={_cs(styles.numberOutput, className)}>
            <div className={styles.label}>
                { label }
            </div>
            <Numeral
                className={styles.value}
                value={value}
                normalize
            />
        </div>
    );
}
