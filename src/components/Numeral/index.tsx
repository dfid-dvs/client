import React from 'react';
import { _cs, isDefined, formattedNormalize, Lang, addSeparator } from '@togglecorp/fujs';
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
        output = number.toFixed(1);
        suffix = normalizeSuffix;
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
