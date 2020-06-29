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

function Link({ to }: { to: string | undefined }) {
    return (
        <a
            href={to}
            target="_blank"
            rel="noopener noreferrer"
        >
            {to}
        </a>
    );
}

interface ExtendedProgram extends Program {
    devTrackerLink: string;
    dPortalLink: string;
}

const programKeySelector = (data: ExtendedProgram) => data.id;

interface ColumnOrderingItem {
    name: string;
}
const staticColumnOrdering: ColumnOrderingItem[] = [
    { name: 'name' },
    { name: 'code' },
    { name: 'totalBudget' },
    { name: 'devTrackerLink' },
    { name: 'dPortalLink' },
    { name: 'description' },
];

interface Props {
    programs: number[];
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

    const extendedPrograms = programListResponse?.results.map(program => ({
        ...program,
        dPortalLink: `http://d-portal.org/ctrack.html?country_code=NP#view=act&aid=GB-1-${program.code}`,
        devTrackerLink: `https://devtracker.dfid.gov.uk/projects/GB-1-${program.code}`,
    }));

    const { sortState, setSortState } = useSortState();
    const { filtering, setFilteringItem, getFilteringItem } = useFilterState();
    const { ordering, moveOrderingItem } = useOrderState(staticColumnOrdering);

    const columns = useMemo(
        () => {
            type numericKeys = ExtractKeys<ExtendedProgram, number>;
            type stringKeys = ExtractKeys<ExtendedProgram, string>;

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

                // FIXME:
                cellAsHeader: true,
                cellRenderer: Cell,
                cellRendererParams: (key: number, datum: ExtendedProgram) => ({
                    value: datum[colName],
                }),

                sorter: (foo: ExtendedProgram, bar: ExtendedProgram) => compareString(
                    foo[colName],
                    bar[colName],
                ),
                valueSelector: (foo: ExtendedProgram) => foo[colName],
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
                cellRendererParams: (key: number, datum: ExtendedProgram) => ({
                    value: datum[colName],
                    normalize: true,
                }),

                sorter: (foo: ExtendedProgram, bar: ExtendedProgram) => compareNumber(
                    foo[colName],
                    bar[colName],
                ),
                valueSelector: (foo: ExtendedProgram) => foo[colName],
                valueType: 'number',
            });

            const linkColumn = (colName: stringKeys) => ({
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

                cellRenderer: Link,
                cellRendererParams: (key: number, datum: ExtendedProgram) => ({
                    to: datum[colName],
                }),

                sorter: (foo: ExtendedProgram, bar: ExtendedProgram) => compareString(
                    foo[colName],
                    bar[colName],
                ),

                valueSelector: (foo: ExtendedProgram) => foo[colName],
                valueType: 'string',
            });

            return [
                createColumn(stringColumn, 'name', 'Name', true),
                createColumn(stringColumn, 'code', 'Code'),
                createColumn(numberColumn, 'totalBudget', 'Budget'),
                createColumn(linkColumn, 'devTrackerLink', 'Dev Tracker'),
                createColumn(linkColumn, 'dPortalLink', 'D-Portal'),
                createColumn(stringColumn, 'description', 'Description'),
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
        extendedPrograms,
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
