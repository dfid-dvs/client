import React from 'react';
import { _cs, isDefined, formattedNormalize, Lang, addSeparator } from '@togglecorp/fujs';
import styles from './styles.css';

const getPrecision = (value: number | undefined) => {
    if (!value) {
        return 0;
    }

    const absolute = Math.abs(value);
    if (absolute < 1) {
        return Math.ceil(-Math.log10(absolute)) + 1;
    }
    return 2;
};


interface Props {
    value: number | undefined;
    precision?: number | undefined;
    className?: string;
    normalize?: boolean;
    separatorShown?: boolean;
}
function Numeral({
    value,
    precision = getPrecision(value),
    className: classNameFromProps,
    normalize,
    separatorShown = true,
}: Props) {
    if (!isDefined(value)) {
        return null;
    }

    const sanitizedValue = Number.parseFloat(String(value));
    if (Number.isNaN(sanitizedValue)) {
        return null;
    }

    const className = _cs(classNameFromProps, styles.numeral);

    let output: string | undefined | null = '';
    let suffix = '';

    if (normalize) {
        const { number, normalizeSuffix = '' } = formattedNormalize(sanitizedValue, Lang.en);
        suffix = normalizeSuffix;
        if (suffix !== '') {
            output = number.toFixed(1);
        } else {
            output = number.toFixed(precision);
        }
    } else {
        output = sanitizedValue.toFixed(precision);
    }

    if (separatorShown) {
        output = addSeparator(output, ',');
    }

    return (
        <div className={className}>
            {`${output}${suffix}`}
        </div>
    );
}
export default Numeral;
