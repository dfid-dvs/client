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

import { ExtractKeys } from '#utils/common';

import { FiveW } from '../../../types';

import styles from './styles.css';


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
    const { ordering, moveOrderingItem, setOrderingItemVisibility } = useOrderState([
        { name: 'name' },
        { name: 'allocatedBudget' },
        { name: 'maleBeneficiary' },
        { name: 'femaleBeneficiary' },
        { name: 'totalBeneficiary' },
    ]);

    const columns = useMemo(
        () => {
            type numericKeys = ExtractKeys<FiveW, number>;
            type stringKeys = ExtractKeys<FiveW, string>;

            const stringColumn = (colName: stringKeys) => ({
                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    name: colName,
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
                    name: colName,
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
        [
            sortState, setSortState,
            getFilteringItem, setFilteringItem,
            moveOrderingItem, setOrderingItemVisibility,
        ],
    );

    const orderedColumns = useOrdering(columns, ordering);
    const filteredFiveW = useFiltering(filtering, orderedColumns, fiveW);
    const sortedFiveW = useSorting(sortState, orderedColumns, filteredFiveW);

    const value = convertTableData(
        sortedFiveW,
        orderedColumns,
        {
            name: v => v.name,
            allocatedBudget: v => v.allocatedBudget,
            maleBeneficiary: v => v.maleBeneficiary,
            femaleBeneficiary: v => v.femaleBeneficiary,
            totalBeneficiary: v => v.totalBeneficiary,
        },
    );

    const handleDownload = useDownloading(
        'Region',
        value,
    );

    return (
        <div className={_cs(styles.regionTable, className)}>
            <header className={styles.header}>
                <Button
                    className={styles.backButton}
                    onClick={onCloseButtonClick}
                    transparent
                    title="Go back"
                >
                    <IoMdArrowRoundBack />
                </Button>
                <h3 className={styles.heading}>
                    Regions
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
                    data={sortedFiveW}
                    keySelector={fiveWKeySelector}
                    columns={orderedColumns}
                />
            </div>
        </div>
    );
}

export default RegionWiseTable;
