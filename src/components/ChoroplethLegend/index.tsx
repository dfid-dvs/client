import React, { useState, useEffect } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import styles from './styles.css';

function Numeral({
    value,
    precision = 2,
    className,
}: {
    value: number | undefined;
    precision?: number | undefined;
    className?: string;
}) {
    if (!isDefined(value)) {
        return null;
    }

    const sanitizedValue = Number.parseFloat(String(value));
    if (Number.isNaN(sanitizedValue)) {
        return null;
    }

    return (
        <div className={className}>
            { sanitizedValue.toFixed(precision) }
        </div>
    );
}

const ChoroplethLegend = (
    {
        minValue,
        legend,
        className,
    }: {
        minValue: number;
        legend: {[key: string]: number};
        className?: string;
    },
) => (
    <div className={_cs(className, styles.choroplethLegend)}>
        { isDefined(minValue) && (
            <Numeral
                className={styles.min}
                value={minValue}
                precision={2}
            />
        )}
        { Object.keys(legend).map((color) => {
            const value = legend[color];
            return (
                <div
                    className={styles.legendElement}
                    key={color}
                >
                    <div
                        className={styles.color}
                        style={{ backgroundColor: color }}
                    />
                    <div className={styles.value}>
                        <Numeral
                            value={value}
                            precision={2}
                        />
                    </div>
                </div>
            );
        })}
    </div>
);

export default ChoroplethLegend;
