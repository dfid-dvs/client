import React from 'react';
import { _cs, isDefined, formattedNormalize, Lang } from '@togglecorp/fujs';

import styles from './styles.css';

const getPrecision = (value: number | undefined) => {
    if (!value) {
        return 0;
    }

    if (value < 0.1) {
        return 4;
    }

    if (value < 1) {
        return 3;
    }

    return 2;
};

function Numeral({
    value,
    precision = getPrecision(value),
    className,
    normalize,
}: {
    value: number | undefined;
    precision?: number | undefined;
    className?: string;
    normalize?: boolean;
}) {
    if (!isDefined(value)) {
        return null;
    }

    const sanitizedValue = Number.parseFloat(String(value));
    if (Number.isNaN(sanitizedValue)) {
        return null;
    }

    if (normalize) {
        const { number, normalizeSuffix = '' } = formattedNormalize(sanitizedValue, Lang.en);

        return (
            <div className={className}>
                {`${number.toFixed(1)}${normalizeSuffix}`}
            </div>
        );
    }

    return (
        <div className={className}>
            { sanitizedValue.toFixed(precision) }
        </div>
    );
}

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
