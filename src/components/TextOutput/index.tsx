import React from 'react';
import { isDefined, _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface TextOutputProps {
    label: string | number;
    value: React.ReactNode | null;
    multiline?: boolean;
}

function TextOutput({
    label,
    value,
    multiline = false,
}: TextOutputProps) {
    return (
        <div className={_cs(styles.textOutput, multiline && styles.multiline)}>
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
