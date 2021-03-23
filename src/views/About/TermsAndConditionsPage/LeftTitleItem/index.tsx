import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import useHash from '#hooks/useHash';
import styles from './styles.css';

interface LeftTitleItemProps {
    title: string;
    className?: string;
}

export default function LeftTitleItem(props: LeftTitleItemProps) {
    const {
        title,
        className,
    } = props;

    const hash = useHash();

    const isSelectedItem: boolean = useMemo(() => {
        const spacedHash = hash?.replace(/%20/g, ' ');
        return title === spacedHash;
    }, [title, hash]);

    return (
        <a
            className={_cs(
                styles.title,
                className,
                isSelectedItem && styles.selected,
            )}
            href={`#${title}`}
        >
            {title}
        </a>
    );
}
