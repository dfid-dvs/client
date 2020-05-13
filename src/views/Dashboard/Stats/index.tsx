import React, { useState, useMemo } from 'react';
import { compareString, compareNumber, _cs } from '@togglecorp/fujs';

import { apiEndPoint } from '#utils/constants';
import useRequest from '#hooks/useRequest';
import { MultiResponse } from '#types';

import Table, { createColumn } from '#components/Table';
import useSorting, { useSortState } from '#components/Table/useSorting';
import useFiltering, { useFilterState } from '#components/Table/useFiltering';
import HeaderCell from '#components/Table/HeaderCell';
import Cell from '#components/Table/Cell';
import { SortDirection, FilterType } from '#components/Table/types';
import Numeral from '#components/Numeral';

import { FiveW } from '../types';

import styles from './styles.css';

interface Program {
    id: number;
    name: string;
    description?: string;
    sector: number[];
    subsector: number[];
    markerCategory: number[];
    markerValue: number;
    partner: unknown[];
    code: string;
    budget?: number;
}

const fiveWKeySelector = (data: FiveW) => data.id;
interface RegionWiseTableProps {
    className?: string;
    fiveW: FiveW[];
}
function RegionWiseTable(props: RegionWiseTableProps) {
    const {
        className,
        fiveW,
    } = props;

    const { sortState, setSortState } = useSortState();
    const { filtering, setFilteringItem, getFilteringItem } = useFilterState();

    const columns = useMemo(
        () => {
            const column1 = createColumn('name', colName => ({
                title: 'Name',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSortState,
                    sortable: true,
                    sortDirection: colName === sortState?.name ? sortState?.direction : undefined,

                    filterType: FilterType.string,
                    filterValue: getFilteringItem(colName),
                    onFilterValueChange: setFilteringItem,
                },

                cellAsHeader: true,
                cellRenderer: Cell,
                cellRendererParams: (key: number, datum: FiveW) => ({
                    value: datum[colName],
                }),

                sorter: (foo: FiveW, bar: FiveW) => compareString(
                    foo[colName],
                    bar[colName],
                ),
                filterValueSelector: (foo: FiveW) => foo[colName],
            }));
            const column2 = createColumn('allocatedBudget', colName => ({
                title: 'Allocated Budget',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSortState,
                    sortable: true,
                    sortDirection: colName === sortState?.name ? sortState?.direction : undefined,
                    defaultSortDirection: SortDirection.dsc,

                    filterType: FilterType.number,
                    filterValue: getFilteringItem(colName),
                    onFilterValueChange: setFilteringItem,
                },

                cellRenderer: Numeral,
                cellRendererParams: (key: number, datum: FiveW) => ({
                    value: datum[colName],
                    normalize: true,
                }),

                sorter: (foo: FiveW, bar: FiveW) => compareNumber(
                    foo[colName],
                    bar[colName],
                ),
                filterValueSelector: (foo: FiveW) => foo[colName],
            }));
            const column3 = createColumn('maleBeneficiary', colName => ({
                title: 'Male Beneficiary',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSortState,
                    sortable: true,
                    sortDirection: colName === sortState?.name ? sortState?.direction : undefined,
                    defaultSortDirection: SortDirection.dsc,

                    filterType: FilterType.number,
                    filterValue: getFilteringItem(colName),
                    onFilterValueChange: setFilteringItem,
                },

                cellRenderer: Numeral,
                cellRendererParams: (key: number, datum: FiveW) => ({
                    value: datum[colName],
                    normalize: true,
                }),

                sorter: (foo: FiveW, bar: FiveW) => compareNumber(
                    foo[colName],
                    bar[colName],
                ),
                filterValueSelector: (foo: FiveW) => foo[colName],
            }));
            const column4 = createColumn('femaleBeneficiary', colName => ({
                id: 'femaleBeneficiary',
                title: 'Female Beneficiary',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSortState,
                    sortable: true,
                    sortDirection: colName === sortState?.name ? sortState?.direction : undefined,
                    defaultSortDirection: SortDirection.dsc,

                    filterType: FilterType.number,
                    filterValue: getFilteringItem(colName),
                    onFilterValueChange: setFilteringItem,
                },

                cellRenderer: Numeral,
                cellRendererParams: (key: number, datum: FiveW) => ({
                    value: datum[colName],
                    normalize: true,
                }),

                sorter: (foo: FiveW, bar: FiveW) => compareNumber(
                    foo[colName],
                    bar[colName],
                ),
                filterValueSelector: (foo: FiveW) => foo[colName],
            }));
            const column5 = createColumn('totalBeneficiary', colName => ({
                title: 'Total Beneficiary',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSortState,
                    sortable: true,
                    sortDirection: colName === sortState?.name ? sortState?.direction : undefined,
                    defaultSortDirection: SortDirection.dsc,

                    filterType: FilterType.number,
                    filterValue: getFilteringItem(colName),
                    onFilterValueChange: setFilteringItem,
                },

                cellRenderer: Numeral,
                cellRendererParams: (key: number, datum: FiveW) => ({
                    value: datum.totalBeneficiary,
                    normalize: true,
                }),

                sorter: (foo: FiveW, bar: FiveW) => compareNumber(
                    foo[colName],
                    bar[colName],
                ),
                filterValueSelector: (foo: FiveW) => foo[colName],
            }));
            return [
                column1,
                column2,
                column3,
                column4,
                column5,
            ];
        },
        [sortState, getFilteringItem, setFilteringItem, setSortState],
    );

    const filteredFiveW = useFiltering(filtering, columns, fiveW);
    const sortedFiveW = useSorting(sortState, columns, filteredFiveW);

    return (
        <div className={className}>
            <h3>Region-wise data</h3>
            <Table
                data={sortedFiveW}
                keySelector={fiveWKeySelector}
                columns={columns}
            />
        </div>
    );
}

const programKeySelector = (data: Program) => data.id;

interface ProgramWiseTableProps {
    className?: string;
}
function ProgramWiseTable(props: ProgramWiseTableProps) {
    const {
        className,
    } = props;
    const [
        programsPending,
        programListResponse,
    ] = useRequest<MultiResponse<Program>>(`${apiEndPoint}/core/program/`, 'program-list');

    const programs = programListResponse?.results;

    /*
    const columns = useMemo(
        () => ([
            {
                id: 'code',
                title: 'Code',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSorting,
                },

                cellRenderer: Cell,
                cellRendererParams: (key: number, datum: Program) => ({
                    value: datum.code,
                }),

                sorter: (foo: Program, bar: Program) => compareString(
                    foo.code,
                    bar.code,
                ),
            },
            {
                id: 'name',
                title: 'Name',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSorting,
                },

                cellAsHeader: true,
                cellRenderer: Cell,
                cellRendererParams: (key: number, datum: Program) => ({
                    value: datum.name,
                }),

                sorter: (foo: Program, bar: Program) => compareString(
                    foo.name,
                    bar.name,
                ),
            },
            {
                id: 'budget',
                title: 'Allocated Budget',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSorting,
                    // defaultSortDirection: SortDirection.dsc,
                },

                cellRenderer: Numeral,
                cellRendererParams: (key: number, datum: Program) => ({
                    value: datum.budget,
                    normalize: true,
                }),

                sorter: (foo: Program, bar: Program) => compareNumber(
                    foo.budget,
                    bar.budget,
                ),
            },
            {
                id: 'description',
                title: 'Description',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSorting,
                },

                cellRenderer: Cell,
                cellRendererParams: (key: number, datum: Program) => ({
                    value: datum.description,
                }),

                sorter: (foo: Program, bar: Program) => compareString(
                    foo.description,
                    bar.description,
                ),
            },
        ]),
        [],
    );
    */

    const { sortState, setSortState } = useSortState();
    const { filtering, setFilteringItem, getFilteringItem } = useFilterState();

    const columns = useMemo(
        () => {
            const column1 = createColumn('name', colName => ({
                title: 'Name',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSortState,
                    sortable: true,
                    sortDirection: colName === sortState?.name ? sortState?.direction : undefined,

                    filterType: FilterType.string,
                    filterValue: getFilteringItem(colName),
                    onFilterValueChange: setFilteringItem,
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
            }));
            const column2 = createColumn('code', colName => ({
                title: 'Code',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSortState,
                    sortable: true,
                    sortDirection: colName === sortState?.name ? sortState?.direction : undefined,

                    filterType: FilterType.string,
                    filterValue: getFilteringItem(colName),
                    onFilterValueChange: setFilteringItem,
                },

                cellRenderer: Cell,
                cellRendererParams: (key: number, datum: Program) => ({
                    value: datum[colName],
                }),

                sorter: (foo: Program, bar: Program) => compareString(
                    foo[colName],
                    bar[colName],
                ),
                filterValueSelector: (foo: Program) => foo[colName],
            }));
            const column3 = createColumn('description', colName => ({
                title: 'Description',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSortState,
                    sortable: true,
                    sortDirection: colName === sortState?.name ? sortState?.direction : undefined,

                    filterType: FilterType.string,
                    filterValue: getFilteringItem(colName),
                    onFilterValueChange: setFilteringItem,
                },

                cellRenderer: Cell,
                cellRendererParams: (key: number, datum: Program) => ({
                    value: datum[colName],
                }),

                sorter: (foo: Program, bar: Program) => compareString(
                    foo[colName],
                    bar[colName],
                ),
                filterValueSelector: (foo: Program) => foo[colName],
            }));
            const column4 = createColumn('budget', colName => ({
                title: 'Budget',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSortState,
                    sortable: true,
                    sortDirection: colName === sortState?.name ? sortState?.direction : undefined,
                    defaultSortDirection: SortDirection.dsc,

                    filterType: FilterType.number,
                    filterValue: getFilteringItem(colName),
                    onFilterValueChange: setFilteringItem,
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
            }));
            return [
                column1,
                column2,
                column3,
                column4,
            ];
        },
        [sortState, getFilteringItem, setFilteringItem, setSortState],
    );

    const filteredPrograms = useFiltering(filtering, columns, programs);
    const sortedPrograms = useSorting(sortState, columns, filteredPrograms);

    return (
        <div className={className}>
            <h3>Program-wise data</h3>
            <Table
                data={sortedPrograms}
                keySelector={programKeySelector}
                columns={columns}
            />
        </div>
    );
}

interface Props {
    className: string;
    fiveW: FiveW[];
}


function Stats(props: Props) {
    const { className, fiveW } = props;

    return (
        <div className={_cs(className, styles.stats)}>
            <RegionWiseTable
                fiveW={fiveW}
            />
            <ProgramWiseTable />
        </div>
    );
}
export default Stats;
