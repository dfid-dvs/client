import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Numeral from '#components/Numeral';

import styles from './styles.css';

function SummaryOutput({
    label,
    value,
    className,
}: {
    label: string;
    value: number | undefined;
    className?: string;
}) {
    return (
        <div className={_cs(styles.summaryOutput, className)}>
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

export default SummaryOutput;
