import React, { useMemo, useCallback } from 'react';
import { IoMdDownload } from 'react-icons/io';
import { compareString, compareNumber, _cs } from '@togglecorp/fujs';

import BudgetFlowSankey from '#components/BudgetFlowSankey';
import Button from '#components/Button';
import Cell from '#components/Table/Cell';
import HeaderCell from '#components/Table/HeaderCell';
import Numeral from '#components/Numeral';
import PopupPage from '#components/PopupPage';
import Table, { createColumn } from '#components/Table';
import useDownloading, { convertTableData } from '#components/Table/useDownloading';
import useFiltering, { useFilterState } from '#components/Table/useFiltering';
import useOrdering, { useOrderState } from '#components/Table/useOrdering';
import useSorting, { useSortState } from '#components/Table/useSorting';
import { SortDirection, FilterType } from '#components/Table/types';

import useRequest from '#hooks/useRequest';
import { MultiResponse, Program, SankeyData } from '#types';
import { ExtractKeys } from '#utils/common';
import { apiEndPoint } from '#utils/constants';

import styles from './styles.css';

interface Node {
    name: string;
}

/*
const sankeyData: SankeyData<Node> = {
    nodes: [
        { title: 'Program A', color: 'red' },
        { title: 'Program B', color: 'red' },

        { title: 'Component A.1', color: 'blue' },
        { title: 'Component A.2', color: 'blue' },
        { title: 'Component B.1', color: 'blue' },

        { title: 'Partner X', color: 'green' },
        { title: 'Partner Y', color: 'green' },
    ],
    links: [
        { source: 0, target: 2, value: 200 },
        { source: 0, target: 3, value: 100 },
        { source: 1, target: 4, value: 50 },

        { source: 2, target: 5, value: 200 },
        { source: 3, target: 6, value: 95 },
        { source: 4, target: 5, value: 50 },
    ],
};
*/

const sankeyData: SankeyData<Node> = {
    nodes: [
        {
            name: 'Family Planning Project',
        },
        {
            name: 'Access to Finance Programme',
        },
        {
            name: 'Strengthening Disaster Resilience in Nepal',
        },
        {
            name: 'Family Planning Project - Monitoring and Evaluation',
        },
        {
            name: 'Family Planning Project - Financial Assistance',
        },
        {
            name: 'Family Planning Project - UNFPA Implementation',
        },
        {
            name: 'Family Planning Project - MSI Implementation',
        },
        {
            name: 'Access to Finance for the Poor Programme',
        },
        {
            name: 'Promoting safer schools in Nepal (resource, non-...',
        },
        {
            name: 'Monitoring and Evaluations Learning Unit (MEL) -...',
        },
        {
            name: 'Strengthening urban resilience in disaster prone...',
        },
        {
            name: 'Policy and Institutions Facility (PIF) - (resour...',
        },
        {
            name: 'Disaster resilience institution strengthening an...',
        },
        {
            name: 'Responding to Humanitarian emergencies and suppo...',
        },
        {
            name: "WFP's Emergency logistics preparedness (resource...",
        },
        {
            name: "UNICEF's Supporting the use of cash in emergency...",
        },
        {
            name: 'Adventist Dev & Relief Agency',
        },
        {
            name: 'BRITISH RED CROSS',
        },
        {
            name: 'CARE NEPAL',
        },
        {
            name: 'Crown Agents Ltd',
        },
        {
            name: 'Government of Nepal Health Sector Programme 2',
        },
        {
            name: 'ICF Consulting Services Ltd',
        },
        {
            name: 'IOD PARC',
        },
        {
            name: 'Louis Berger Group, Inc',
        },
        {
            name: 'Marie Stopes International MSI',
        },
        {
            name: 'MOTT MACDONALD LTD',
        },
        {
            name: 'OXFAM INSTITUTIONAL INCOME ACCOUNT',
        },
        {
            name: 'OXFORD POLICY MANAGEMENT',
        },
        {
            name: 'THE SAVE THE CHILDREN FUND',
        },
        {
            name: 'UNDP',
        },
        {
            name: 'UNDP GBP Contributions',
        },
        {
            name: 'UNFPA',
        },
        {
            name: 'UNICEF',
        },
        {
            name: 'WFP CONTRIBUTIONS UNIT',
        },
    ],
    links: [
        {
            source: 0,
            target: 3,
            value: 405585,
        },
        {
            source: 0,
            target: 4,
            value: 4872020,
        },
        {
            source: 0,
            target: 5,
            value: 2845955,
        },
        {
            source: 0,
            target: 6,
            value: 1027308.14653,
        },
        {
            source: 1,
            target: 7,
            value: 14758404.7721015,
        },
        {
            source: 2,
            target: 8,
            value: 11995657.70994,
        },
        {
            source: 2,
            target: 9,
            value: 1392893,
        },
        {
            source: 2,
            target: 10,
            value: 6441095.75001,
        },
        {
            source: 2,
            target: 11,
            value: 1669200,
        },
        {
            source: 2,
            target: 12,
            value: 5110873.99998,
        },
        {
            source: 2,
            target: 13,
            value: 3870580,
        },
        {
            source: 2,
            target: 14,
            value: 4254325.99998,
        },
        {
            source: 2,
            target: 15,
            value: 586264,
        },
        {
            source: 10,
            target: 16,
            value: 73914.75,
        },
        {
            source: 12,
            target: 17,
            value: 5510874,
        },
        {
            source: 13,
            target: 18,
            value: 549324,
        },
        {
            source: 8,
            target: 19,
            value: 11995657.70994,
        },
        {
            source: 4,
            target: 20,
            value: 4872020,
        },
        {
            source: 10,
            target: 21,
            value: 6367181.00001,
        },
        {
            source: 9,
            target: 22,
            value: 1392893,
        },
        {
            source: 7,
            target: 23,
            value: 14758404.7721015,
        },
        {
            source: 6,
            target: 24,
            value: 1027308.14653,
        },
        {
            source: 3,
            target: 25,
            value: 405585,
        },
        {
            source: 13,
            target: 26,
            value: 172374,
        },
        {
            source: 11,
            target: 27,
            value: 1669200,
        },
        {
            source: 13,
            target: 28,
            value: 300000,
        },
        {
            source: 14,
            target: 29,
            value: 692262,
        },
        {
            source: 13,
            target: 30,
            value: 148882,
        },
        {
            source: 5,
            target: 31,
            value: 2845955,
        },
        {
            source: 13,
            target: 32,
            value: 1386263.99998,
        },
        {
            source: 13,
            target: 33,
            value: 5062063.99998,
        },
    ],
};

interface ColumnOrderingItem {
    name: string;
    type: 'string' | 'number';
}
const staticColumnOrdering: ColumnOrderingItem[] = [
    { name: 'name', type: 'string' },
    { name: 'code', type: 'string' },
    { name: 'totalBudget', type: 'number' },
    { name: 'description', type: 'number' },
];

const programKeySelector = (data: Program) => data.id;

interface Props {
    className?: string;
}
function ProgramWiseTable(props: Props) {
    const {
        className,
    } = props;
    const [
        programsPending,
        programListResponse,
    ] = useRequest<MultiResponse<Program>>(`${apiEndPoint}/core/program/?program=1`, 'program-list');

    const [
        sankeyPending,
        sankeyResponse,
    ] = useRequest<SankeyData<Node>>(`${apiEndPoint}/core/sankey-program/`, 'sankey-data');

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

    const orderedColumns = useOrdering(columns, ordering);
    const filteredPrograms = useFiltering(filtering, orderedColumns, programListResponse?.results);
    const sortedPrograms = useSorting(sortState, orderedColumns, filteredPrograms);

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
        <PopupPage
            className={className}
            title="Programs"
            parentLink="/dashboard/"
            parentName="dashboard"
        >
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
            <BudgetFlowSankey
                className={styles.budgetFlow}
                data={sankeyData}
                colorSelector={item => ['red', 'blue', 'green'][item.depth]}
                nameSelector={item => item.name}
            />
            <div
                className={styles.table}
            >
                <Table
                    data={sortedPrograms}
                    keySelector={programKeySelector}
                    columns={orderedColumns}
                />
            </div>
        </PopupPage>
    );
}

export default ProgramWiseTable;
