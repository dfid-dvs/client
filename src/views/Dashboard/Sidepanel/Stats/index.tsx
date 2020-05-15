import React, { useMemo } from 'react';
import { IoMdClose } from 'react-icons/io';
import { compareString, compareNumber, _cs } from '@togglecorp/fujs';

import { apiEndPoint } from '#utils/constants';
import useRequest from '#hooks/useRequest';
import { MultiResponse } from '#types';

import Table, { createColumn } from '#components/Table';
import useSorting, { useSortState } from '#components/Table/useSorting';
import useFiltering, { useFilterState } from '#components/Table/useFiltering';
import HeaderCell from '#components/Table/HeaderCell';
import Cell from '#components/Table/Cell';
import Button from '#components/Button';
import { SortDirection, FilterType } from '#components/Table/types';
import Numeral from '#components/Numeral';

import { FiveW } from '../../types';

import styles from './styles.css';

type ExtractKeys<T, M> = {
    [K in keyof Required<T>]: Required<T>[K] extends M ? K : never
}[keyof T];

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

const fiveWKeySelector = (data: FiveW) => data.id;
interface RegionWiseTableProps {
    className?: string;
    fiveW: FiveW[];
    onCloseButtonClick: () => void;
}
function RegionWiseTable(props: RegionWiseTableProps) {
    const {
        className,
        fiveW,
        onCloseButtonClick,
    } = props;

    const { sortState, setSortState } = useSortState();
    const { filtering, setFilteringItem, getFilteringItem } = useFilterState();

    const columns = useMemo(
        () => {
            type numericKeys = ExtractKeys<FiveW, number>;
            type stringKeys = ExtractKeys<FiveW, string>;

            const stringColumn = (colName: stringKeys) => ({
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
            });

            return [
                createColumn(stringColumn, 'name', 'Name', true),
                createColumn(numberColumn, 'allocatedBudget', 'Allocated Budget'),
                createColumn(numberColumn, 'maleBeneficiary', 'Male Beneficiary'),
                createColumn(numberColumn, 'femaleBeneficiary', 'Female Beneficiary'),
                createColumn(numberColumn, 'totalBeneficiary', 'Total Beneficiary'),
            ];
        },
        [sortState, getFilteringItem, setFilteringItem, setSortState],
    );

    const filteredFiveW = useFiltering(filtering, columns, fiveW);
    const sortedFiveW = useSorting(sortState, columns, filteredFiveW);

    return (
        <div className={_cs(styles.regionTable, className)}>
            <header className={styles.header}>
                <h3 className={styles.heading}>
                    Regions
                </h3>
                <div className={styles.actions}>
                    <Button
                        onClick={onCloseButtonClick}
                        transparent
                        title="Close"
                    >
                        <IoMdClose />
                    </Button>
                </div>
            </header>
            <div className={styles.content}>
                <Table
                    data={sortedFiveW}
                    keySelector={fiveWKeySelector}
                    columns={columns}
                />
            </div>
        </div>
    );
}

const programKeySelector = (data: Program) => data.id;

interface ProgramWiseTableProps {
    className?: string;
    onCloseButtonClick: () => void;
}
function ProgramWiseTable(props: ProgramWiseTableProps) {
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
        [sortState, getFilteringItem, setFilteringItem, setSortState],
    );

    const filteredPrograms = useFiltering(filtering, columns, programs);
    const sortedPrograms = useSorting(sortState, columns, filteredPrograms);

    return (
        <div className={_cs(styles.programTable, className)}>
            <header className={styles.header}>
                <h3 className={styles.heading}>
                    Programs
                </h3>
                <div className={styles.actions}>
                    <Button
                        onClick={onCloseButtonClick}
                        title="Close"
                        transparent
                    >
                        <IoMdClose />
                    </Button>
                </div>
            </header>
            <div className={styles.content}>
                <Table
                    data={sortedPrograms}
                    keySelector={programKeySelector}
                    columns={columns}
                />
            </div>
        </div>
    );
}

interface Props {
    className: string;
    fiveW: FiveW[] | undefined;
    onCloseButtonClick: () => void;
}

function Stats(props: Props) {
    const {
        className,
        fiveW,
        onCloseButtonClick,
    } = props;

    return (
        <div className={_cs(className, styles.stats)}>
            { fiveW ? (
                <RegionWiseTable
                    onCloseButtonClick={onCloseButtonClick}
                    fiveW={fiveW}
                />
            ) : (
                <ProgramWiseTable
                    onCloseButtonClick={onCloseButtonClick}
                />
            )}
        </div>
    );
}
export default Stats;
