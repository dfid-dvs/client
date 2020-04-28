import React from 'react';
import { isDefined } from '@togglecorp/fujs';

import styles from './styles.css';

interface TextOutputProps {
    label: string | number;
    value: React.ReactNode | null;
}

function TextOutput({
    label,
    value,
}: TextOutputProps) {
    return (
        <div className={styles.textOutput}>
            <div className={styles.label}>
                { label }
            </div>
            { isDefined(value) ? (
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
