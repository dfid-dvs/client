import React, { memo, useCallback } from 'react';
import { _cs, isTruthyString } from '@togglecorp/fujs';
import {
    FaSortUp,
    FaSortDown,
    FaSort,
} from 'react-icons/fa';

import Button from '#components/Button';
import TextInput from '#components/TextInput';

import { BaseHeader, SortDirection, FilterType } from '../types';
import { SortParameter } from '../useSorting';
import { FilterParameter } from '../useFiltering';

import styles from './styles.css';

interface HeaderCellProps extends BaseHeader {
    onSortChange?: (value: SortParameter | undefined) => void;
    sortable?: boolean;
    sortDirection?: SortDirection;
    defaultSortDirection?: SortDirection;

    filterType?: FilterType;

    filterValue?: Omit<FilterParameter, 'id'>;
    onFilterValueChange: (name: string, value: Omit<FilterParameter, 'id'>) => void;
}

function HeaderCell(props: HeaderCellProps) {
    const {
        className,
        title,
        name,

        defaultSortDirection,
        sortDirection,
        sortable,
        onSortChange,

        filterType,
        filterValue,
        onFilterValueChange,
    } = props;
    console.warn('Rendering header cell');

    const handleSortClick = useCallback(
        () => {
            if (!onSortChange) {
                return;
            }
            let newSortDirection: SortDirection | undefined;
            if (!sortDirection) {
                newSortDirection = defaultSortDirection;
            } else if (sortDirection === SortDirection.asc) {
                newSortDirection = SortDirection.dsc;
            } else if (sortDirection === SortDirection.dsc) {
                newSortDirection = SortDirection.asc;
            }

            if (newSortDirection) {
                onSortChange({ name, direction: newSortDirection });
            } else {
                onSortChange(undefined);
            }
        },
        [name, onSortChange, sortDirection, defaultSortDirection],
    );

    return (
        <div className={_cs(className, styles.headerCell)}>
            <div className={styles.titleContainer}>
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
            <div className={styles.filterContainer}>
                {filterType === FilterType.string && (
                    <TextInput
                        className={styles.textInput}
                        value={filterValue?.subMatch}
                        placeholder="Search"
                        onChange={(value: string) => {
                            onFilterValueChange(
                                name,
                                { ...filterValue, subMatch: value },
                            );
                        }}
                    />
                )}
                {filterType === FilterType.number && (
                    <>
                        <TextInput
                            className={styles.numberInput}
                            value={filterValue?.greaterThanOrEqualTo}
                            placeholder="Min"
                            type="number"
                            onChange={(value: string) => {
                                const numericValue = isTruthyString(value) ? +value : undefined;
                                onFilterValueChange(
                                    name,
                                    { ...filterValue, greaterThanOrEqualTo: numericValue },
                                );
                            }}
                        />
                        <TextInput
                            className={styles.numberInput}
                            value={filterValue?.lessThanOrEqualTo}
                            type="number"
                            placeholder="Max"
                            onChange={(value: string) => {
                                const numericValue = isTruthyString(value) ? +value : undefined;
                                onFilterValueChange(
                                    name,
                                    { ...filterValue, lessThanOrEqualTo: numericValue },
                                );
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

HeaderCell.defaultProps = {
    defaultSortDirection: SortDirection.asc,
};

export default memo(HeaderCell);
