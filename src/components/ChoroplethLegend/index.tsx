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

const ChoroplethLegend = (
    {
        minValue,
        legend,
        className,
        zeroPrecision,
    }: {
        minValue: number;
        legend: {[key: string]: number};
        className?: string;
        zeroPrecision?: boolean;
    },
) => (
    <div className={_cs(className, styles.choroplethLegend)}>
        { isDefined(minValue) && (
            <Numeral
                className={styles.min}
                value={minValue}
                precision={zeroPrecision ? 0 : undefined}
                normalize
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
                            precision={zeroPrecision ? 0 : undefined}
                            normalize
                        />
                    </div>
                </div>
            );
        })}
    </div>
);

export default ChoroplethLegend;
