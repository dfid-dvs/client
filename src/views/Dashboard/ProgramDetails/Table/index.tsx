import React, { useMemo, useCallback } from 'react';
import { IoMdDownload } from 'react-icons/io';
import { compareString, compareNumber, isTruthyString } from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';

import Button from '#components/Button';
import Cell from '#components/Table/Cell';
import HeaderCell from '#components/Table/HeaderCell';
import Numeral from '#components/Numeral';
import Table, { createColumn } from '#components/Table';
import useDownloading, { convertTableData } from '#components/Table/useDownloading';
import useFiltering, { useFilterState } from '#components/Table/useFiltering';
import useOrdering, { useOrderState } from '#components/Table/useOrdering';
import useSorting, { useSortState } from '#components/Table/useSorting';
import { SortDirection, FilterType } from '#components/Table/types';

import useRequest from '#hooks/useRequest';
import {
    MultiResponse,
    Program,
} from '#types';
import { ExtractKeys, prepareUrlParams as p } from '#utils/common';
import { apiEndPoint } from '#utils/constants';

import styles from './styles.css';

const programKeySelector = (data: Program) => data.id;

const staticColumnOrdering: ColumnOrderingItem[] = [
    { name: 'name' },
    { name: 'code' },
    { name: 'totalBudget' },
    { name: 'description' },
];

interface Props {
    projects: number[];
}

function ProgramTable(props: Props) {
    const {
        programs,
    } = props;

    const params = p({
        program: programs,
    });

    const programUrl = isTruthyString(params)
        ? `${apiEndPoint}/core/program/?${params}`
        : `${apiEndPoint}/core/program/`;

    const [
        programsPending,
        programListResponse,
    ] = useRequest<MultiResponse<Program>>(programUrl, 'program-list');

    const { sortState, setSortState } = useSortState();
    const { filtering, setFilteringItem, getFilteringItem } = useFilterState();
    const { ordering, moveOrderingItem } = useOrderState(staticColumnOrdering);

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

                    hideable: false,
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
                valueSelector: (foo: Program) => foo[colName],
                valueType: 'string',
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

                    hideable: false,
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
                valueSelector: (foo: Program) => foo[colName],
                valueType: 'number',
            });

            return [
                createColumn(stringColumn, 'name', 'Name', true),
                createColumn(stringColumn, 'code', 'Code'),
                createColumn(stringColumn, 'description', 'Description'),
                createColumn(numberColumn, 'totalBudget', 'Budget'),
            ];
        },
        [
            sortState, setSortState,
            getFilteringItem, setFilteringItem,
            moveOrderingItem,
        ],
    );

    const orderedColumns = useOrdering(
        columns,
        ordering,
    );
    const filteredPrograms = useFiltering(
        filtering,
        orderedColumns,
        programListResponse?.results,
    );
    const sortedPrograms = useSorting(
        sortState,
        orderedColumns,
        filteredPrograms,
    );

    const getCsvValue = useCallback(
        () => convertTableData(
            sortedPrograms,
            orderedColumns,
        ),
        [sortedPrograms, orderedColumns],
    );

    const handleDownload = useDownloading(
        'Program',
        getCsvValue,
    );

    return (
        <>
            <div className={styles.tableActions}>
                <Button
                    onClick={handleDownload}
                    icons={(
                        <IoMdDownload />
                    )}
                    disabled={!sortedPrograms || !orderedColumns}
                >
                    Download as csv
                </Button>
            </div>
            <div className={styles.tableContainer}>
                {programsPending && (
                    <Backdrop>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                <div className={styles.overflowContainer}>
                    <Table
                        className={styles.table}
                        data={sortedPrograms}
                        keySelector={programKeySelector}
                        columns={orderedColumns}
                    />
                </div>
            </div>
        </>
    );
}

export default ProgramTable;
