import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Numeral from '#components/Numeral';

import styles from './styles.css';

function SummaryItem({
    label,
    value,
    className,
}: {
    label: string;
    value: number | undefined;
    className?: string;
}) {
    return (
        <div className={_cs(styles.summaryItem, className)}>
            <div className={styles.label}>
                { label }
            </div>
            <div className={styles.dataLine}>
                <Numeral
                    className={styles.value}
                    value={value}
                    normalize
                    placeholder="-"
                />
                <div className={styles.line} />
            </div>
        </div>
    );
}

export default SummaryItem;
