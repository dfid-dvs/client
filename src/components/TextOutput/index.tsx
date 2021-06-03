import React from 'react';
import { isDefined, _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface TextOutputProps {
    className?: string;
    label: string | number;
    value: React.ReactNode | null;
    multiline?: boolean;
    noPadding?: boolean;
    labelClassName?: string;
    valueClassName?: string;
}

function TextOutput({
    label,
    value,
    multiline = false,
    noPadding = false,
    labelClassName,
    valueClassName,
    className,
}: TextOutputProps) {
    return (
        <div
            className={_cs(
                className,
                styles.textOutput,
                multiline && styles.multiline,
                noPadding && styles.noPadding,
            )}
        >
            <div className={_cs(labelClassName, styles.label)}>
                { label }
            </div>
            {isDefined(value) ? (
                <div className={_cs(valueClassName, styles.value)}>
                    { value }
                </div>
            ) : (
                <div className={styles.nullValue}>
                    N/A
                </div>
            )}
        </div>
    );
}
export default TextOutput;
