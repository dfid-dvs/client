import React, { useMemo } from 'react';
import { IoMdArrowRoundBack, IoMdDownload } from 'react-icons/io';
import { compareString, compareNumber, _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import Numeral from '#components/Numeral';
import Table, { createColumn } from '#components/Table';
import Cell from '#components/Table/Cell';
import HeaderCell from '#components/Table/HeaderCell';
import { SortDirection, FilterType } from '#components/Table/types';
import useFiltering, { useFilterState } from '#components/Table/useFiltering';
import useOrdering, { useOrderState } from '#components/Table/useOrdering';
import useSorting, { useSortState } from '#components/Table/useSorting';
import useDownloading, { convertTableData } from '#components/Table/useDownloading';

import { apiEndPoint } from '#utils/constants';
import { ExtractKeys } from '#utils/common';
import useRequest from '#hooks/useRequest';
import { MultiResponse } from '#types';

import styles from './styles.css';

interface Program {
    id: number;
    name: string;
    description?: string;
    sector: number[];
    subsector: number[];
    markerCategory: number[];
    markerValue: number[];
    partner: unknown[];
    code: string;
    budget?: number;
}

const programKeySelector = (data: Program) => data.id;

interface Props {
    className?: string;
    onCloseButtonClick: () => void;
}
function ProgramWiseTable(props: Props) {
    const {
        className,
        onCloseButtonClick,
    } = props;
    const [
        programsPending,
        programListResponse,
    ] = useRequest<MultiResponse<Program>>(`${apiEndPoint}/core/program/`, 'program-list');

    const programs = programListResponse?.results;

    const { sortState, setSortState } = useSortState();
    const { filtering, setFilteringItem, getFilteringItem } = useFilterState();
    const { ordering, moveOrderingItem, setOrderingItemVisibility } = useOrderState([
        { name: 'name' },
        { name: 'code' },
        { name: 'budget' },
        { name: 'description' },
    ]);

    const columns = useMemo(
        () => {
            type numericKeys = ExtractKeys<Program, number>;
            type stringKeys = ExtractKeys<Program, string>;

            const stringColumn = (colName: stringKeys) => ({
                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSortState,
                    sortable: true,
                    sortDirection: colName === sortState?.name ? sortState?.direction : undefined,

                    filterType: FilterType.string,
                    filterValue: getFilteringItem(colName),
                    onFilterValueChange: setFilteringItem,

                    draggable: true,
                    onReorder: moveOrderingItem,

                    hideable: colName !== 'name',
                    onVisibilityChange: setOrderingItemVisibility,
                },

                cellAsHeader: true,
                cellRenderer: Cell,
                cellRendererParams: (key: number, datum: Program) => ({
                    value: datum[colName],
                }),

                sorter: (foo: Program, bar: Program) => compareString(
                    foo[colName],
                    bar[colName],
                ),
                filterValueSelector: (foo: Program) => foo[colName],
            });

            const numberColumn = (colName: numericKeys) => ({
                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSortState,
                    sortable: true,
                    sortDirection: colName === sortState?.name ? sortState?.direction : undefined,
                    defaultSortDirection: SortDirection.dsc,

                    filterType: FilterType.number,
                    filterValue: getFilteringItem(colName),
                    onFilterValueChange: setFilteringItem,

                    draggable: true,
                    onReorder: moveOrderingItem,

                    hideable: true,
                    onVisibilityChange: setOrderingItemVisibility,
                },

                cellRenderer: Numeral,
                cellRendererParams: (key: number, datum: Program) => ({
                    value: datum[colName],
                    normalize: true,
                }),

                sorter: (foo: Program, bar: Program) => compareNumber(
                    foo[colName],
                    bar[colName],
                ),
                filterValueSelector: (foo: Program) => foo[colName],
            });

            return [
                createColumn(stringColumn, 'name', 'Name', true),
                createColumn(stringColumn, 'code', 'Code'),
                createColumn(stringColumn, 'description', 'Description'),
                createColumn(numberColumn, 'budget', 'Budget'),
            ];
        },
        [
            sortState, setSortState,
            getFilteringItem, setFilteringItem,
            moveOrderingItem, setOrderingItemVisibility,
        ],
    );

    const orderedColumns = useOrdering(columns, ordering);
    const filteredPrograms = useFiltering(filtering, orderedColumns, programs);
    const sortedPrograms = useSorting(sortState, orderedColumns, filteredPrograms);

    const value = convertTableData(
        sortedPrograms,
        orderedColumns,
        {
            name: v => v.name,
            code: v => v.code,
            budget: v => v.budget,
            description: v => v.description,
        },
    );

    const handleDownload = useDownloading(
        'Program',
        value,
    );

    return (
        <div className={_cs(styles.programTable, className)}>
            <header className={styles.header}>
                <Button
                    className={styles.backButton}
                    onClick={onCloseButtonClick}
                    title="Go back"
                    transparent
                >
                    <IoMdArrowRoundBack />
                </Button>
                <h3 className={styles.heading}>
                    Programs
                </h3>
                <div className={styles.actions}>
                    <Button
                        onClick={handleDownload}
                        icons={(
                            <IoMdDownload />
                        )}
                        disabled={!value}
                    >
                        Download
                    </Button>
                </div>
            </header>
            <div className={styles.content}>
                <Table
                    data={sortedPrograms}
                    keySelector={programKeySelector}
                    columns={orderedColumns}
                />
            </div>
        </div>
    );
}

export default ProgramWiseTable;