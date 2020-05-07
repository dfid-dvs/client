import React, { memo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    FaSortUp,
    FaSortDown,
    FaSort,
} from 'react-icons/fa';

import Button from '#components/Button';

import { BaseHeader, SortDirection } from '../types';

import styles from './styles.css';

interface Sort {
    name: string;
    direction: SortDirection;
}

function HeaderCell(props: BaseHeader & { onSortChange?: (value: Sort | undefined) => void }) {
    const {
        className,
        title,
        name,

        sortDirection,
        sortable,
        onSortChange,
    } = props;

    const handleSortClick = useCallback(
        () => {
            let newSortDirection = SortDirection.dsc;
            if (!sortDirection || sortDirection === SortDirection.dsc) {
                newSortDirection = SortDirection.asc;
            }
            if (onSortChange) {
                onSortChange({ name, direction: newSortDirection });
            }
        },
        [name, onSortChange, sortDirection],
    );

    return (
        <div className={_cs(className, styles.headerCell)}>
            {sortable && (
                <Button
                    transparent
                    onClick={handleSortClick}
                >
                    {!sortDirection && <FaSort />}
                    {sortDirection === SortDirection.asc && <FaSortUp />}
                    {sortDirection === SortDirection.dsc && <FaSortDown />}
                </Button>
            )}
            <div className={styles.title}>
                {title}
            </div>
        </div>
    );
}

export default memo(HeaderCell);
