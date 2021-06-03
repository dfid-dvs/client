import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Numeral from '#components/Numeral';
import Label from '#components/Label';

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
            <Label>
                { label }
            </Label>
        </div>
    );
}

export default StatItem;
