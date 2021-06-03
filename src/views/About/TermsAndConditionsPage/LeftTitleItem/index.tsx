import React from 'react';
import { _cs } from '@togglecorp/fujs';

import useHash from '#hooks/useHash';
import styles from './styles.css';

interface LeftTitleItemProps {
    title: string;
    className?: string;
    id: number;
}

export default function LeftTitleItem(props: LeftTitleItemProps) {
    const {
        title,
        className,
        id,
    } = props;

    const hash = useHash();

    const isSelectedItem = !hash ? false : id === +hash;
    return (
        <a
            className={_cs(
                styles.title,
                className,
                isSelectedItem && styles.selected,
            )}
            href={`#${id}`}
            dangerouslySetInnerHTML={{ __html: title }}
        />
    );
}
