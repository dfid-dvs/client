import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import { SortDirection, BaseHeader } from './types';

import styles from './styles.css';

interface Column<D, K, C, H> {
    id: string;
    title?: string;
    sorter?: (a: D, b: D) => number;

    headerCellRenderer: React.ComponentType<H>;
    headerCellRendererParams: Omit<H, keyof BaseHeader>;
    headerCellRendererClassName?: string;

    cellRenderer: React.ComponentType<C>;
    cellRendererParams: (key: K, datum: D, index: number) => Omit<C, 'className' | 'name'>;
    cellRendererClassName?: string;

    cellAsHeader?: boolean;
}
type VerifyColumn<T, D, K> = unknown extends (
    T extends Column<D, K, infer A, infer B>
        ? never
        : unknown
)
    ? never
    : unknown

// TODO:
// - get rid of any
// - better approach to VerifyColumn
// - column ordering

function Table<D, K extends string | number, C extends Column<D, K, any, any>>(
    props: {
        className?: string;
        caption?: React.ReactNode;
        keySelector: (data: D, index: number) => K;
        columns: C[] & VerifyColumn<C, D, K>;
        data: D[] | undefined;
        captionClassName?: string;
        headerRowClassName?: string;
        headerCellClassName?: string;
        rowClassName?: string;
        cellClassName?: string;

        sortDirection?: SortDirection;
        sortColumn?: string;
        // columnOrder
    },
) {
    const {
        data,
        keySelector,
        columns,
        caption,

        className,
        captionClassName,
        headerRowClassName,
        headerCellClassName,
        rowClassName,
        cellClassName,

        sortDirection,
        sortColumn,
    } = props;

    const selectedSorter = useMemo(
        () => {
            const columnToSort = columns.find(column => column.id === sortColumn);
            return columnToSort?.sorter;
        },
        [columns, sortColumn],
    );

    const sortedData = useMemo(
        () => {
            if (!data || !selectedSorter) {
                return data;
            }
            if (sortDirection === SortDirection.dsc) {
                return [...data].sort(selectedSorter).reverse();
            }
            return [...data].sort(selectedSorter);
        },
        [data, selectedSorter, sortDirection],
    );

    return (
        <table className={_cs(styles.table, className)}>
            {caption && (
                <caption
                    className={captionClassName}
                >
                    {caption}
                </caption>
            )}
            <thead>
                <tr className={_cs(styles.headerRow, headerRowClassName)}>
                    {columns.map((column) => {
                        const {
                            id,
                            title,
                            sorter,
                            headerCellRenderer: Renderer,
                            headerCellRendererClassName,
                            headerCellRendererParams,
                        } = column;

                        const children = (
                            <Renderer
                                {...headerCellRendererParams}
                                name={id}
                                title={title}
                                sortable={!!sorter}
                                className={headerCellRendererClassName}
                                sortDirection={sortColumn === id ? sortDirection : undefined}
                            />
                        );
                        return (
                            <th
                                key={id}
                                scope="col"
                                className={_cs(styles.headerCell, headerCellClassName)}
                            >
                                {children}
                            </th>
                        );
                    })}
                </tr>
            </thead>
            <tbody>
                {sortedData?.map((datum, index) => {
                    const key = keySelector(datum, index);
                    return (
                        <tr
                            key={key}
                            className={_cs(styles.row, rowClassName)}
                        >
                            {columns.map((column) => {
                                const {
                                    id,
                                    cellRenderer: Renderer,
                                    cellRendererClassName,
                                    cellRendererParams,
                                    cellAsHeader,
                                } = column;
                                const otherProps = cellRendererParams(key, datum, index);
                                const children = (
                                    <Renderer
                                        {...otherProps}
                                        className={cellRendererClassName}
                                        name={id}
                                    />
                                );
                                if (cellAsHeader) {
                                    return (
                                        <th
                                            key={id}
                                            className={_cs(styles.headerCell, cellClassName)}
                                            scope="row"
                                        >
                                            {children}
                                        </th>
                                    );
                                }
                                return (
                                    <td
                                        key={id}
                                        className={_cs(styles.cell, cellClassName)}
                                    >
                                        {children}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

export default Table;
