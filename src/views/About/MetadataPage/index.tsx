import React, { useMemo, useCallback } from 'react';
import { IoMdDownload } from 'react-icons/io';
import { compareString } from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';

import Button from '#components/Button';
import Cell from '#components/Table/Cell';
import HeaderCell from '#components/Table/HeaderCell';
import Table, { createColumn } from '#components/Table';
import useDownloading, { convertTableData } from '#components/Table/useDownloading';
import useFiltering, { useFilterState } from '#components/Table/useFiltering';
import useOrdering, { useOrderState } from '#components/Table/useOrdering';
import useSorting, { useSortState } from '#components/Table/useSorting';
import { FilterType } from '#components/Table/types';

import { ExtractKeys } from '#utils/common';
import useRequest from '#hooks/useRequest';
import { Indicator, MultiResponse } from '#types';
import { apiEndPoint } from '#utils/constants';

import styles from './styles.css';

import AboutPageContainer from '../AboutPageContainer';

interface LinkProps {
    to: string | undefined;
    title: string | undefined;
    className: string | undefined;
}

function Link({ to, title, className }: LinkProps) {
    if (!to) {
        return null;
    }

    return (
        <a
            className={className}
            href={to}
            target="_blank"
            rel="noopener noreferrer"
        >
            {title}
        </a>
    );
}

const indicatorKeySelector = (data: Indicator) => data.id;

interface ColumnOrderingItem {
    name: string;
}
const staticColumnOrdering: ColumnOrderingItem[] = [
    { name: 'fullTitle' },
    { name: 'abstract' },
    { name: 'category' },
    { name: 'source' },
    { name: 'federalLevel' },
    { name: 'unit' },
    { name: 'dataType' },
    { name: 'url' },
];

function MetadataPage() {
    const { sortState, setSortState } = useSortState();
    const { filtering, setFilteringItem, getFilteringItem } = useFilterState();
    const { ordering, moveOrderingItem } = useOrderState(staticColumnOrdering);

    const indicatorListGetUrl = `${apiEndPoint}/core/indicator-list/`;
    const [
        indicatorListPending,
        indicatorListResponse,
    ] = useRequest<MultiResponse<Indicator>>(indicatorListGetUrl, 'indicator-list');
    const indicators = indicatorListResponse?.results;
    const columns = useMemo(
        () => {
            type stringKeys = ExtractKeys<Indicator, string>;

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
                cellRendererParams: (key: number, datum: Indicator) => ({
                    value: datum[colName],
                }),

                sorter: (foo: Indicator, bar: Indicator) => compareString(
                    foo[colName],
                    bar[colName],
                ),
                valueSelector: (foo: Indicator) => foo[colName],
                valueType: 'string',
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
                cellRendererParams: (key: number, datum: Indicator) => ({
                    to: datum[colName],
                    title: datum.url,
                }),

                sorter: (foo: Indicator, bar: Indicator) => compareString(
                    foo[colName],
                    bar[colName],
                ),

                valueSelector: (foo: Indicator) => foo[colName],
                valueType: 'string',
            });

            return [
                createColumn(stringColumn, 'fullTitle', 'Name', true),
                createColumn(stringColumn, 'abstract', 'Abstract'),
                createColumn(stringColumn, 'category', 'Category'),
                createColumn(stringColumn, 'source', 'Source'),
                createColumn(stringColumn, 'federalLevel', 'Federal Level'),
                createColumn(stringColumn, 'unit', 'Unit'),
                createColumn(stringColumn, 'dataType', 'Data Type'),
                createColumn(linkColumn, 'url', 'URL'),
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
    const filteredIndicators = useFiltering(
        filtering,
        orderedColumns,
        indicators,
    );
    const sortedIndicators = useSorting(
        sortState,
        orderedColumns,
        filteredIndicators,
    );

    const getCsvValue = useCallback(
        () => convertTableData(
            sortedIndicators,
            orderedColumns,
        ),
        [sortedIndicators, orderedColumns],
    );

    const handleDownload = useDownloading(
        'Indicators',
        getCsvValue,
    );
    const title = 'Meta Data';
    const subTitle = 'Please find the indicators enlisted.';

    return (
        <AboutPageContainer>
            <div className={styles.container}>
                <div className={styles.firstSection}>
                    <div className={styles.title}>
                        {title}
                    </div>
                    <div className={styles.subTitle}>
                        {subTitle}
                    </div>
                </div>
                {indicatorListPending && (
                    <Backdrop>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                {!indicatorListPending && (
                    <div className={styles.tableSection}>
                        <div className={styles.tableActions}>
                            <Button
                                onClick={handleDownload}
                                icons={(
                                    <IoMdDownload />
                                )}
                                disabled={!sortedIndicators || !orderedColumns}
                                className={styles.downloadButton}
                                variant="outline"
                                transparent
                            >
                                Download as csv
                            </Button>
                        </div>
                        <div className={styles.tableContainer}>
                            <div className={styles.overflowContainer}>
                                <Table
                                    className={styles.table}
                                    data={sortedIndicators}
                                    keySelector={indicatorKeySelector}
                                    columns={orderedColumns}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AboutPageContainer>
    );
}

export default MetadataPage;
