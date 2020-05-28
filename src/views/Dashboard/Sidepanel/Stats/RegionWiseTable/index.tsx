import React, { useMemo, useContext, useState } from 'react';
import { IoMdArrowRoundBack, IoMdDownload } from 'react-icons/io';
import { compareString, compareNumber, _cs, isDefined, listToMap } from '@togglecorp/fujs';

import Button from '#components/Button';
import NavbarContext from '#components/NavbarContext';
import Numeral from '#components/Numeral';
import Table, { createColumn } from '#components/Table';
import Cell from '#components/Table/Cell';
import HeaderCell from '#components/Table/HeaderCell';
import { SortDirection, FilterType } from '#components/Table/types';
import useDownloading, { convertTableData } from '#components/Table/useDownloading';
import useFiltering, { useFilterState } from '#components/Table/useFiltering';
import useOrdering, { useOrderState } from '#components/Table/useOrdering';
import useSorting, { useSortState } from '#components/Table/useSorting';

import { MultiResponse } from '#types';
import { apiEndPoint } from '#utils/constants';
import useRequest from '#hooks/useRequest';
import { ExtractKeys } from '#utils/common';

import { FiveW } from '../../../types';

import styles from './styles.css';


const fiveWKeySelector = (data: FiveW) => data.id;

interface IndicatorValue {
    indicatorId: number;
    code: string;
    value: number;
}

interface RegionWiseTableProps {
    className?: string;
    fiveW: FiveW[];
    onCloseButtonClick: () => void;
}

interface ColumnOrderingItem {
    name: string;
}

interface ExtendedFiveW extends FiveW {
    indicators: {
        [key: number]: number | undefined;
    };
}

function RegionWiseTable(props: RegionWiseTableProps) {
    const {
        className,
        fiveW,
        onCloseButtonClick,
    } = props;

    const { regionLevel } = useContext(NavbarContext);

    const [selectedIndicators, setSelectedIndicators] = useState([
        /*
        25,
        62,
        118,
        132,
        133,
        */
        147,
        148,
        149,
        150,
        151,
        152,
        153,
        154,
        155,
    ]);

    const options: RequestInit | undefined = useMemo(
        () => (selectedIndicators ? {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                indicatorId: selectedIndicators,
            }),
        } : undefined),
        [selectedIndicators],
    );

    let regionIndicatorUrl: string | undefined;
    if (isDefined(selectedIndicators)) {
        regionIndicatorUrl = `${apiEndPoint}/core/${regionLevel}-indicator/`;
    }
    const [
        regionIndicatorListPending,
        regionIndicatorListResponse,
    ] = useRequest<MultiResponse<IndicatorValue>>(regionIndicatorUrl, 'indicator', options);

    const finalFiveW = useMemo(
        (): ExtendedFiveW[] | undefined => {
            if (!fiveW) {
                return undefined;
            }
            const mapping = listToMap(
                regionIndicatorListResponse?.results,
                item => `${item.code}-${item.indicatorId}`,
                item => item.value,
            );
            return fiveW.map(item => ({
                ...item,
                indicators: listToMap(
                    selectedIndicators,
                    id => id,
                    id => mapping[`${item.code}-${id}`],
                ),
            }));
        },
        [fiveW, regionIndicatorListResponse, selectedIndicators],
    );

    console.warn(finalFiveW);

    const columnOrdering: ColumnOrderingItem[] = [
        { name: 'name' },
        { name: 'allocatedBudget' },
        { name: 'maleBeneficiary' },
        { name: 'femaleBeneficiary' },
        { name: 'totalBeneficiary' },
        ...selectedIndicators.map(item => ({ name: `indicator${item}` })),
    ];

    const { sortState, setSortState } = useSortState();
    const { filtering, setFilteringItem, getFilteringItem } = useFilterState();
    const { ordering, moveOrderingItem, setOrderingItemVisibility } = useOrderState(columnOrdering);

    const columns = useMemo(
        () => {
            type numericKeys = ExtractKeys<ExtendedFiveW, number>;
            type stringKeys = ExtractKeys<ExtendedFiveW, string>;

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
                cellRendererParams: (key: number, datum: ExtendedFiveW) => ({
                    value: datum[colName],
                }),

                sorter: (foo: ExtendedFiveW, bar: ExtendedFiveW) => compareString(
                    foo[colName],
                    bar[colName],
                ),
                filterValueSelector: (foo: ExtendedFiveW) => foo[colName],
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
                cellRendererParams: (key: number, datum: ExtendedFiveW) => ({
                    value: datum[colName],
                    normalize: true,
                }),

                sorter: (foo: ExtendedFiveW, bar: ExtendedFiveW) => compareNumber(
                    foo[colName],
                    bar[colName],
                ),
                filterValueSelector: (foo: ExtendedFiveW) => foo[colName],
            });

            // eslint-disable-next-line max-len
            const dynamicNumberColumn = (keySelector: (item: ExtendedFiveW) => number | undefined) => (colName: string) => ({
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
                cellRendererParams: (key: number, datum: ExtendedFiveW) => ({
                    value: keySelector(datum),
                    normalize: true,
                }),

                sorter: (foo: ExtendedFiveW, bar: ExtendedFiveW) => compareNumber(
                    keySelector(foo),
                    keySelector(bar),
                ),
                filterValueSelector: (foo: ExtendedFiveW) => keySelector(foo),
            });

            return [
                createColumn(stringColumn, 'name', 'Name', true),
                createColumn(numberColumn, 'allocatedBudget', 'Allocated Budget'),
                createColumn(numberColumn, 'maleBeneficiary', 'Male Beneficiary'),
                createColumn(numberColumn, 'femaleBeneficiary', 'Female Beneficiary'),
                createColumn(numberColumn, 'totalBeneficiary', 'Total Beneficiary'),
                ...selectedIndicators.map(id => createColumn(dynamicNumberColumn(item => item.indicators[id]), `indicator${id}`, String(id))),
            ];
        },
        [
            sortState, setSortState,
            getFilteringItem, setFilteringItem,
            moveOrderingItem, setOrderingItemVisibility,
            selectedIndicators,
        ],
    );

    const orderedColumns = useOrdering(columns, ordering);
    const filteredFiveW = useFiltering(filtering, orderedColumns, finalFiveW);
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
