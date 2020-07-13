import React from 'react';
import { isDefined, _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface TextOutputProps {
    label: string | number;
    value: React.ReactNode | null;
    multiline?: boolean;
    noPadding?: boolean;
}

function TextOutput({
    label,
    value,
    multiline = false,
    noPadding = false,
}: TextOutputProps) {
    return (
        <div
            className={_cs(
                styles.textOutput,
                multiline && styles.multiline,
                noPadding && styles.noPadding,
            )}
        >
            <div className={styles.label}>
                { label }
            </div>
            {isDefined(value) ? (
                <div className={styles.value}>
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
