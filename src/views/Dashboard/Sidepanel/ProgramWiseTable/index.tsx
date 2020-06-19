import React, { useMemo, useCallback, useContext, useState } from 'react';
import { IoMdDownload } from 'react-icons/io';
import { compareString, compareNumber, _cs } from '@togglecorp/fujs';

import DomainContext from '#components/DomainContext';
import SegmentInput from '#components/SegmentInput';
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
import {
    MultiResponse,
    Program,
    SankeyData,
    DomainContextProps,
} from '#types';
import { ExtractKeys } from '#utils/common';
import { apiEndPoint } from '#utils/constants';

import styles from './styles.css';

// TODO: move sankey and table in different pages with their own request handling

type TabOptionKeys = 'table' | 'sankey';
interface TabOption {
    key: TabOptionKeys;
    label: string;
}
const tabOptions: TabOption[] = [
    { key: 'table', label: 'Table' },
    { key: 'sankey', label: 'Sankey' },
];

interface Node {
    name: string;
}

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
const sankeyColorSelector = (item: { depth: number }) => ['red', 'blue', 'green'][item.depth];
const sankeyNameSelector = (item: { name: string }) => item.name;

interface Props {
    className?: string;
}
function ProgramWiseTable(props: Props) {
    const {
        className,
    } = props;

    const {
        programs,
    } = useContext<DomainContextProps>(DomainContext);

    const [selectedTab, setSelectedTab] = useState<TabOptionKeys>('table');

    const [
        programsPending,
        programListResponse,
    ] = useRequest<MultiResponse<Program>>(`${apiEndPoint}/core/program/?program=1`, 'program-list');

    const url = programs.length > 0
        ? `${apiEndPoint}/core/sankey-program/?program=${programs.join(',')}`
        : `${apiEndPoint}/core/sankey-program/`;

    const [
        sankeyPending,
        sankeyResponse,
    ] = useRequest<SankeyData<Node>>(url, 'sankey-data');

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
            <div className={styles.tabActions}>
                <SegmentInput
                    options={tabOptions}
                    optionKeySelector={item => item.key}
                    optionLabelSelector={item => item.label}
                    value={selectedTab}
                    onChange={setSelectedTab}
                />
            </div>
            {selectedTab === 'sankey' && (
                <div className={styles.sankey}>
                    <BudgetFlowSankey
                        data={sankeyResponse}
                        colorSelector={sankeyColorSelector}
                        nameSelector={sankeyNameSelector}
                    />
                </div>
            )}
            {selectedTab === 'table' && (
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
                    <div
                        className={styles.table}
                    >
                        <Table
                            data={sortedPrograms}
                            keySelector={programKeySelector}
                            columns={orderedColumns}
                        />
                    </div>
                </>
            )}
        </PopupPage>
    );
}

export default ProgramWiseTable;
