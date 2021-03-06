import React, { useMemo, useEffect, useCallback } from 'react';
import { IoMdDownload } from 'react-icons/io';
import { compareString, compareNumber, listToMap, isDefined, isNotDefined } from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import Button from '#components/Button';
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

import {
    Indicator,
    RegionLevelOption,
} from '#types';
import { ExtractKeys } from '#utils/common';

import useExtendedFiveW, { ExtendedFiveW } from '../../useExtendedFiveW';
import { FiveW } from '../../types';
import styles from './styles.css';

function getIndicatorTitle(indicator: Indicator | undefined) {
    if (!indicator) {
        return '';
    }
    if (!indicator.unit) {
        return indicator.fullTitle;
    }
    return `${indicator.fullTitle} (${indicator.unit})`;
}

function getIndicatorHeaderName(id: number) {
    return `indicator_${id}`;
}
function getIndicatorIdFromHeaderName(key: string) {
    const matching = key.match(/^indicator_(\d+)$/);
    return matching ? +matching[1] : undefined;
}

interface ColumnOrderingItem {
    name: string;
}
const staticColumnOrdering: ColumnOrderingItem[] = [
    { name: 'name' },
    { name: 'allocatedBudget' },
    { name: 'programCount' },
    { name: 'componentCount' },
    { name: 'partnerCount' },
    { name: 'sectorCount' },
];

const fiveWKeySelector = (data: FiveW) => data.id;
const indicatorTitleSelector = (indicator: Indicator) => indicator.fullTitle;
const indicatorKeySelector = (indicator: Indicator) => indicator.id;
const indicatorGroupKeySelector = (indicator: Indicator) => indicator.category;

interface Props {
    indicators: number[];
    onIndicatorsChange: (value: number[] | ((v: number[]) => number[])) => void;

    regionLevel: RegionLevelOption;

    indicatorList: Indicator[] | undefined;
    indicatorListPending: boolean | undefined;

    markerIdList?: string[];
    submarkerIdList?: string[];
    programIdList?: string[];
    componentIdList?: string[];
    partnerIdList?: string[];
    sectorIdList?: string[];
    subsectorIdList?: string[];
}
function RegionTable(props: Props) {
    const {
        markerIdList,
        submarkerIdList,
        programIdList,
        componentIdList,
        partnerIdList,
        sectorIdList,
        subsectorIdList,

        regionLevel,
        indicators,
        onIndicatorsChange,

        indicatorList,
        indicatorListPending,
    } = props;

    const indicatorMapping = useMemo(
        () => listToMap(
            indicatorList,
            item => item.id,
            item => item,
        ),
        [indicatorList],
    );

    const validSelectedIndicators = useMemo(
        () => indicators.filter(i => !!indicatorMapping[i]),
        [indicators, indicatorMapping],
    );

    const [extendedFiveWPending, extendedFiveWList] = useExtendedFiveW(
        regionLevel,
        markerIdList,
        submarkerIdList,
        programIdList,
        componentIdList,
        partnerIdList,
        sectorIdList,
        subsectorIdList,
        validSelectedIndicators,
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
                onIndicatorsChange(oldIndicators => oldIndicators?.filter(
                    item => item !== indicatorId,
                ));
            } else {
                setOrdering(oldOrdering => oldOrdering.filter(
                    item => item.name !== key,
                ));
            }
        },
        [setOrdering, onIndicatorsChange],
    );

    // Synchornize region level
    useEffect(
        () => {
            setOrdering((oldOrdering) => {
                const provinceOrder = oldOrdering.findIndex(item => item.name === 'provinceName');
                const districtOrder = oldOrdering.findIndex(item => item.name === 'districtName');

                let newOrdering = [...oldOrdering];

                if (regionLevel === 'province') {
                    newOrdering = newOrdering.filter(item => (
                        item.name !== 'provinceName' && item.name !== 'districtName'
                    ));
                }
                if (regionLevel === 'district') {
                    newOrdering = newOrdering.filter(item => (
                        item.name !== 'districtName'
                    ));

                    if (provinceOrder === -1) {
                        newOrdering.unshift({
                            name: 'provinceName',
                        });
                    }
                }
                if (regionLevel === 'municipality') {
                    if (provinceOrder === -1) {
                        newOrdering.unshift({
                            name: 'provinceName',
                        });
                    }

                    if (districtOrder === -1) {
                        newOrdering.splice(
                            provinceOrder === -1 ? 1 : provinceOrder + 1,
                            0,
                            { name: 'districtName' },
                        );
                    }
                }
                return newOrdering;
            });
        },
        [regionLevel, setOrdering],
    );

    // Synchronize selected indicators with ordering
    useEffect(
        () => {
            // only add ordering for now
            setOrdering((oldOrdering) => {
                const indicatorsMapping = new Set(indicators);
                const remainingItems = oldOrdering.filter((orderingItem) => {
                    const indicatorId = getIndicatorIdFromHeaderName(orderingItem.name);
                    return isNotDefined(indicatorId) || indicatorsMapping.has(indicatorId);
                });

                if (!indicators) {
                    return remainingItems;
                }

                const oldIndicators = new Set(
                    oldOrdering
                        .map(item => getIndicatorIdFromHeaderName(item.name))
                        .filter(isDefined),
                );
                const newItems: ColumnOrderingItem[] = indicators
                    ?.filter(selectedIndicator => (
                        !oldIndicators.has(selectedIndicator)
                    )).map(item => ({
                        name: getIndicatorHeaderName(item),
                    }));

                return [...remainingItems, ...newItems];
            });
        },
        [indicators, setOrdering],
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
                valueType: 'string',
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
                valueType: 'number',
            });

            const staticColumns = [
                createColumn(stringColumn, 'name', 'Name', true),
                createColumn(numberColumn, 'allocatedBudget', 'Budget Spend (£)'),
                createColumn(numberColumn, 'componentCount', 'Components (count)'),
                createColumn(numberColumn, 'programCount', 'Programs (count)'),
                createColumn(numberColumn, 'partnerCount', 'Partners (count)'),
                createColumn(numberColumn, 'sectorCount', 'Sectors (count)'),
            ];

            if (regionLevel === 'district') {
                staticColumns.unshift(
                    createColumn(stringColumn, 'provinceName', 'Province Name'),
                );
            } else if (regionLevel === 'municipality') {
                staticColumns.unshift(
                    createColumn(stringColumn, 'provinceName', 'Province Name'),
                    createColumn(stringColumn, 'districtName', 'District Name'),
                );
            }

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
                valueType: 'number',
            });


            const dynamicColumns = validSelectedIndicators.map(id => createColumn(
                dynamicNumberColumn(item => item.indicators[id]),
                getIndicatorHeaderName(id),
                getIndicatorTitle(indicatorMapping[id]),
            ));

            return dynamicColumns ? [...staticColumns, ...dynamicColumns] : staticColumns;
        },
        [
            sortState, setSortState,
            getFilteringItem, setFilteringItem,
            moveOrderingItem, handleUnselectHeader,
            validSelectedIndicators, indicatorMapping,
            regionLevel,
        ],
    );

    const orderedColumns = useOrdering(columns, ordering);
    const filteredFiveW = useFiltering(filtering, orderedColumns, extendedFiveWList);
    const sortedFiveW = useSorting(sortState, orderedColumns, filteredFiveW);

    const getCsvValue = useCallback(
        () => convertTableData(
            sortedFiveW,
            orderedColumns,
        ),
        [sortedFiveW, orderedColumns],
    );

    const handleDownload = useDownloading(
        'Region',
        getCsvValue,
    );
    return (
        <>
            <div className={styles.tableActions}>
                <MultiSelectInput
                    className={styles.indicatorSelect}
                    placeholder={`Select from ${indicatorList?.length || 0} indicators`}
                    options={indicatorList}
                    onChange={onIndicatorsChange}
                    value={validSelectedIndicators}
                    optionLabelSelector={indicatorTitleSelector}
                    optionKeySelector={indicatorKeySelector}
                    groupKeySelector={indicatorGroupKeySelector}
                    pending={indicatorListPending}
                    allSelectable
                />
                <Button
                    onClick={handleDownload}
                    icons={(
                        <IoMdDownload className={styles.icon} />
                    )}
                    disabled={!sortedFiveW || !orderedColumns}
                    transparent
                    className={styles.downloadButton}
                    variant="secondary-outline"
                >
                    Download as csv
                </Button>
            </div>
            <div className={styles.tableContainer}>
                {extendedFiveWPending && (
                    <Backdrop className={styles.backdrop}>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                <div className={styles.overflowContainer}>
                    <Table
                        className={styles.table}
                        data={sortedFiveW}
                        keySelector={fiveWKeySelector}
                        columns={orderedColumns}
                    />
                </div>
            </div>
        </>
    );
}
export default RegionTable;
