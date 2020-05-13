import React, { useState, useMemo } from 'react';
import { compareString, compareNumber, _cs } from '@togglecorp/fujs';

// import { apiEndPoint } from '#utils/constants';
// import useRequest from '#hooks/useRequest';
// import { MultiResponse } from '#types';

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

interface Props {
    className: string;
    fiveW: FiveW[];
}

const keySelector = (data: FiveW) => data.id;

// const programKeySelector = (data: Program) => data.id;

function Stats(props: Props) {
    const { className, fiveW } = props;

    /*
    const [
        programsPending,
        programListResponse,
    ] = useRequest<MultiResponse<Program>>(`${apiEndPoint}/core/program/`, 'program-list');
    */

    const { sorting, setSorting } = useSortState();
    const { filtering, setFilteringItem, getFilteringItem } = useFilterState();

    // console.warn(filtering);

    const columns = useMemo(
        () => {
            const column1 = createColumn('name', colName => ({
                title: 'Name',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSorting,
                    sortable: true,
                    sortDirection: colName === sorting?.name ? sorting?.direction : undefined,

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
                    onSortChange: setSorting,
                    sortable: true,
                    sortDirection: colName === sorting?.name ? sorting?.direction : undefined,
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
                    onSortChange: setSorting,
                    sortable: true,
                    sortDirection: colName === sorting?.name ? sorting?.direction : undefined,
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
                    onSortChange: setSorting,
                    sortable: true,
                    sortDirection: colName === sorting?.name ? sorting?.direction : undefined,
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
                    onSortChange: setSorting,
                    sortable: true,
                    sortDirection: colName === sorting?.name ? sorting?.direction : undefined,
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
        [sorting, getFilteringItem, setFilteringItem, setSorting],
    );

    const sortedFiveW = useSorting(sorting, columns, fiveW);
    const filteredFiveW = useFiltering(filtering, columns, sortedFiveW);

    /*
    const programColumns = useMemo(
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

    return (
        <div className={_cs(className, styles.stats)}>
            <h3>Region-wise data</h3>
            <Table
                data={filteredFiveW}
                keySelector={keySelector}
                columns={columns}
                // sortDirection={sorting?.direction}
                // sortColumn={sorting?.name}
            />
            {/*
            <h3>Program-wise data</h3>
            <Table
                data={programListResponse?.results}
                keySelector={programKeySelector}
                columns={programColumns}
                // sortDirection={sorting?.direction}
                // sortColumn={sorting?.name}
            />
            */}
        </div>
    );
}
export default Stats;
