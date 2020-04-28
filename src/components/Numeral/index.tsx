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


interface Props {
    value: number | undefined;
    precision?: number | undefined;
    className?: string;
    normalize?: boolean;
}
function Numeral({
    value,
    precision = getPrecision(value),
    className: classNameFromProps,
    normalize,
}: Props) {
    if (!isDefined(value)) {
        return null;
    }

    const sanitizedValue = Number.parseFloat(String(value));
    if (Number.isNaN(sanitizedValue)) {
        return null;
    }

    const className = _cs(classNameFromProps, styles.numeral);

    if (normalize) {
        const { number, normalizeSuffix = '' } = formattedNormalize(sanitizedValue, Lang.en);

        if (normalizeSuffix) {
            return (
                <div className={className}>
                    {`${number.toFixed(1)}${normalizeSuffix}`}
                </div>
            );
        }
    }

    return (
        <div className={className}>
            { sanitizedValue.toFixed(precision) }
        </div>
    );
}
export default Numeral;
