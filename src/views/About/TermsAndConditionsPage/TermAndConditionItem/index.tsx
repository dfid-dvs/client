import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import useHash from '#hooks/useHash';

import styles from './styles.css';

interface TC {
    id: number;
    title: string;
    subTitle: string;
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
        if (!hash) {
            return false;
        }
        return tc.id === +hash;
    }, [tc.id, hash]);

    return (
        <div
            className={_cs(
                styles.tcItem,
                className,
            )}
            id={String(tc.id)}
        >
            <div
                className={_cs(
                    styles.title,
                    isSelectedItem && styles.selected,
                )}
                dangerouslySetInnerHTML={{ __html: tc.title }}
            />
            <div
                className={styles.subTitle}
                dangerouslySetInnerHTML={{ __html: tc.subTitle }}
            />
        </div>
    );
}
