import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import Numeral from '#components/Numeral';

import styles from './styles.css';

function SummaryItem({
    label,
    value,
    total,
    className,
}: {
    label: string;
    value: number | undefined;
    total: number | undefined;
    className?: string;
}) {
    const valueWidth = useMemo(() => {
        if (!value || !total) {
            return 0;
        }
        return value / total * 100;
    }, [value, total]);

    const remWidth = 100 - valueWidth;

    return (
        <div className={_cs(styles.summaryItem, className)}>
            <div className={styles.label}>
                {label}
            </div>
            <div className={styles.dataLine}>
                <div className={styles.valueRow}>
                    { value && (
                        <>
                            <Numeral
                                className={styles.value}
                                value={value}
                                normalize
                                suffix=" / "
                            />
                        </>
                    )}
                    <Numeral
                        className={styles.value}
                        value={total}
                        normalize
                    />
                </div>
                <div className={styles.line}>
                    <div
                        className={styles.valueLine}
                        style={{ width: `${valueWidth}%` }}
                    />
                    <div
                        className={styles.remLine}
                        style={{ width: `${remWidth}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default SummaryItem;
