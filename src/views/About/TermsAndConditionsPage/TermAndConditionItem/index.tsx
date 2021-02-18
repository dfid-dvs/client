import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface TC {
    title: string;
    description: string;
}

interface TermAndConditionItemProps {
    tc: TC;
    className?: string;
}

export default function TermAndConditionItem(props: TermAndConditionItemProps) {
    const {
        tc,
        className,
    } = props;

    return (
        <div className={_cs(styles.tcItem, className)}>
            <div className={styles.title}>
                { tc.title }
            </div>
            <div className={styles.description}>
                { tc.description }
            </div>
        </div>
    );
}
