import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import useHash from '#hooks/useHash';

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

    const hash = useHash();

    const isSelectedItem: boolean = useMemo(() => {
        const spacedHash = hash?.replace(/%20/g, ' ');
        return tc.title === spacedHash;
    }, [tc.title, hash]);

    return (
        <div
            className={_cs(
                styles.tcItem,
                className,
            )}
            id={tc.title}
        >
            <div
                className={_cs(
                    styles.title,
                    isSelectedItem && styles.selected,
                )}
            >
                { tc.title }
            </div>
            <div className={styles.description}>
                { tc.description }
            </div>
        </div>
    );
}
