import React, { memo } from 'react';
import { _cs, isNotDefined, formattedNormalize, Lang, addSeparator } from '@togglecorp/fujs';

import styles from './styles.css';

export function getPrecision(value: number | undefined) {
    if (!value) {
        return 0;
    }

    const absoluteValue = Math.abs(value);
    if (absoluteValue < 1) {
        return Math.ceil(-Math.log10(absoluteValue)) + 1;
    }

    if (absoluteValue > 100) {
        return 0;
    }
    return 2;
}

export function formatNumber(
    value: number | undefined,
    separatorShown = true,
    normalize?: boolean,
    precision?: number,
) {
    if (isNotDefined(value)) {
        return undefined;
    }

    const sanitizedValue = Number.parseFloat(String(value));
    if (Number.isNaN(sanitizedValue)) {
        return undefined;
    }

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

    if (output.match(/\.0+$/)) {
        output = output.substr(0, output.indexOf('.'));
    }

    if (separatorShown) {
        output = addSeparator(output, ',');
    }

    return `${output}${suffix}`;
}


interface NumeralProps {
    value: number | undefined;
    precision?: number | undefined;
    className?: string;
    normalize?: boolean;
    separatorShown?: boolean;
    prefix?: string;
    placeholder?: string;
}
function Numeral({
    value,
    precision = getPrecision(value),
    className: classNameFromProps,
    normalize,
    separatorShown = true,
    prefix = '',
    placeholder = '',
}: NumeralProps) {
    const className = _cs(classNameFromProps, styles.numeral);

    if (isNotDefined(value)) {
        if (placeholder) {
            return (
                <div className={className}>
                    {placeholder}
                </div>
            );
        }
        return null;
    }

    const output = formatNumber(
        value,
        separatorShown,
        normalize,
        precision,
    );

    return (
        <div className={className}>
            {`${prefix}${output}`}
        </div>
    );
}
export default memo(Numeral);
