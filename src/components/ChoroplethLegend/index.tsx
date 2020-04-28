import React from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import Numeral from '#components/Numeral';

import styles from './styles.css';

interface ChoroplethLegend {
    minValue: number | string;
    legend: {[key: string]: number | string};
    className?: string;
    zeroPrecision?: boolean;
    opacity?: number;
}
function ChoroplethLegend(
    {
        minValue,
        legend,
        className,
        zeroPrecision,
        opacity = 1,
    }: ChoroplethLegend,
) {
    const colors = Object.keys(legend);
    if (colors.length <= 0) {
        return null;
    }

    return (
        <div className={_cs(className, styles.choroplethLegend)}>
            {isDefined(minValue) && typeof minValue === 'number' && (
                <Numeral
                    className={styles.min}
                    value={minValue}
                    precision={zeroPrecision ? 0 : undefined}
                    normalize
                />
            )}
            {isDefined(minValue) && typeof minValue === 'string' && (
                minValue
            )}
            {colors.map((color) => {
                const value = legend[color];
                return (
                    <div
                        className={styles.legendElement}
                        key={color}
                    >
                        <div
                            className={styles.color}
                            style={{ backgroundColor: color, opacity }}
                        />
                        <div className={styles.value}>
                            {typeof value === 'number' && (
                                <Numeral
                                    value={value}
                                    precision={zeroPrecision ? 0 : undefined}
                                    normalize
                                />
                            )}
                            {typeof value === 'string' && (
                                value
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default ChoroplethLegend;
