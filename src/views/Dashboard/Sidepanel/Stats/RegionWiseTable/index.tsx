import React, { useMemo, useContext, useState, useEffect, useCallback } from 'react';
import { IoMdArrowRoundBack, IoMdDownload } from 'react-icons/io';
import { compareString, compareNumber, _cs, listToMap, isDefined, isNotDefined } from '@togglecorp/fujs';

import Button from '#components/Button';
import DomainContext from '#components/DomainContext';
import MultiSelectInput from '#components/MultiSelectInput';
import Numeral from '#components/Numeral';
import Table, { createColumn } from '#components/Table';
import Cell from '#components/Table/Cell';
import HeaderCell from '#components/Table/HeaderCell';
import { SortDirection, FilterType } from '#components/Table/types';
import useDownloading, { convertTableData } from '#components/Table/useDownloading';
import useFiltering, { useFilterState } from '#components/Table/useFiltering';
import useOrdering, { useOrderState } from '#components/Table/useOrdering';
import useSorting, { useSortState } from '#components/Table/useSorting';

import useRequest from '#hooks/useRequest';
import { MultiResponse, Indicator } from '#types';
import { ExtractKeys } from '#utils/common';
import { apiEndPoint } from '#utils/constants';

import { FiveW } from '../../../types';

import styles from './styles.css';

function getIndicatorHeaderName(id: number) {
    return `indicator_${id}`;
}
function getIndicatorIdFromHeaderName(key: string) {
    const matching = key.match(/^indicator_(\d+)$/);
    return matching ? +matching[1] : undefined;
}

interface ColumnOrderingItem {
    name: string;
    type: 'string' | 'number';
}
const staticColumnOrdering: ColumnOrderingItem[] = [
    { name: 'name', type: 'string' },
    { name: 'allocatedBudget', type: 'number' },
];

const fiveWKeySelector = (data: FiveW) => data.id;
const indicatorTitleSelector = (indicator: Indicator) => indicator.fullTitle;
const indicatorKeySelector = (indicator: Indicator) => indicator.id;

interface IndicatorValue {
    indicatorId: number;
    code: string;
    value: number;
}

interface RegionWiseTableProps {
    className?: string;
    fiveW: FiveW[] | undefined;
    onCloseButtonClick: () => void;
    indicatorList: Indicator[] | undefined;
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
        indicatorList,
    } = props;

    const { regionLevel } = useContext(DomainContext);

    const [selectedIndicators, setSelectedIndicators] = useState<number[] | undefined>();

    const indicatorMapping = useMemo(
        () => listToMap(
            indicatorList,
            item => item.id,
            item => item,
        ),
        [indicatorList],
    );

    const validSelectedIndicators = useMemo(
        () => selectedIndicators?.filter(i => !!indicatorMapping[i]),
        [selectedIndicators, indicatorMapping],
    );

    const options: RequestInit | undefined = useMemo(
        () => (validSelectedIndicators ? {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                indicatorId: validSelectedIndicators,
            }),
        } : undefined),
        [validSelectedIndicators],
    );

    let regionIndicatorUrl: string | undefined;
    if (isDefined(validSelectedIndicators) && validSelectedIndicators.length > 0) {
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
                    validSelectedIndicators,
                    id => id,
                    id => mapping[`${item.code}-${id}`],
                ),
            }));
        },
        [fiveW, regionIndicatorListResponse, validSelectedIndicators],
    );

    const { sortState, setSortState } = useSortState();
    const { filtering, setFilteringItem, getFilteringItem } = useFilterState();
    const { ordering, moveOrderingItem, setOrdering } = useOrderState(
        staticColumnOrdering,
    );

    const handleUnselectHeader = useCallback(
        (key: string) => {
            const indicatorId = getIndicatorIdFromHeaderName(key);
            if (isDefined(indicatorId)) {
                // should also remove selected indicator
                setSelectedIndicators(oldIndicators => oldIndicators?.filter(
                    item => item !== indicatorId,
                ));
            } else {
                setOrdering(oldOrdering => oldOrdering.filter(
                    item => item.name !== key,
                ));
            }
        },
        [setOrdering],
    );

    // Synchronize selected indicators with ordering
    useEffect(
        () => {
            // only add ordering for now
            setOrdering((oldOrdering) => {
                const selectedIndicatorsMapping = new Set(selectedIndicators);
                const remainingItems = oldOrdering.filter((orderingItem) => {
                    const indicatorId = getIndicatorIdFromHeaderName(orderingItem.name);
                    return isNotDefined(indicatorId) || selectedIndicatorsMapping.has(indicatorId);
                });

                if (!selectedIndicators) {
                    return remainingItems;
                }

                const oldIndicators = new Set(
                    oldOrdering
                        .map(item => getIndicatorIdFromHeaderName(item.name))
                        .filter(isDefined),
                );
                const newItems: ColumnOrderingItem[] | undefined = selectedIndicators
                    ?.filter(selectedIndicator => (
                        !oldIndicators.has(selectedIndicator)
                    )).map(item => ({
                        name: getIndicatorHeaderName(item),
                        type: 'number',
                    }));

                return [...remainingItems, ...newItems];
            });
        },
        [selectedIndicators, setOrdering],
    );

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

                    hideable: false,
                    onHide: handleUnselectHeader,
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
                valueSelector: (foo: ExtendedFiveW) => foo[colName],
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

                    hideable: false,
                    onHide: handleUnselectHeader,
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
                valueSelector: (foo: ExtendedFiveW) => foo[colName],
            });

            const staticColumns = [
                createColumn(stringColumn, 'name', 'Name', true),
                createColumn(numberColumn, 'allocatedBudget', 'Allocated Budget'),
            ];

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
                    onHide: handleUnselectHeader,
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
                valueSelector: keySelector,
            });


            const dynamicColumns = validSelectedIndicators?.map(id => createColumn(
                dynamicNumberColumn(item => item.indicators[id]),
                getIndicatorHeaderName(id),
                indicatorMapping[id]?.fullTitle,
            ));

            return dynamicColumns ? [...staticColumns, ...dynamicColumns] : staticColumns;
        },
        [
            sortState, setSortState,
            getFilteringItem, setFilteringItem,
            moveOrderingItem, handleUnselectHeader,
            validSelectedIndicators, indicatorMapping,
        ],
    );

    const orderedColumns = useOrdering(columns, ordering);
    const filteredFiveW = useFiltering(filtering, orderedColumns, finalFiveW);
    const sortedFiveW = useSorting(sortState, orderedColumns, filteredFiveW);

    const csvValue = useMemo(
        () => convertTableData(
            sortedFiveW,
            orderedColumns,
        ),
        [sortedFiveW, orderedColumns],
    );

    const handleDownload = useDownloading(
        'Region',
        csvValue,
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
                    <MultiSelectInput
                        label="Indicators"
                        className={styles.indicatorsInput}
                        placeholder={`Select from ${indicatorList?.length || 0} indicators`}
                        options={indicatorList}
                        onChange={setSelectedIndicators}
                        value={validSelectedIndicators}
                        optionLabelSelector={indicatorTitleSelector}
                        optionKeySelector={indicatorKeySelector}
                        dropdownContainerClassName={styles.dropdown}
                    />
                    <Button
                        onClick={handleDownload}
                        icons={(
                            <IoMdDownload />
                        )}
                        disabled={!csvValue}
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
