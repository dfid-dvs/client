import React, { useMemo } from 'react';
import { isDefined, _cs } from '@togglecorp/fujs';

import Numeral from '#components/Numeral';
import Label from '#components/Label';

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
        return Math.floor(value / total * 100);
    }, [value, total]);

    const remWidth = 100 - valueWidth;

    return (
        <div className={_cs(styles.summaryItem, className)}>
            <Label className={styles.label}>
                {label}
            </Label>
            <div className={styles.dataLine}>
                <div className={styles.valueRow}>
                    { isDefined(value) && (
                        <>
                            <Numeral
                                className={styles.value}
                                value={value}
                                normalize
                            />
                            <div className={styles.separator}>
                                /
                            </div>
                        </>
                    )}
                    <Numeral
                        className={styles.total}
                        value={total}
                        normalize
                    />
                </div>
                { isDefined(value) && (
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
                )}
            </div>
        </div>
    );
}

export default SummaryItem;
