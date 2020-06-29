import React, { useMemo, useEffect, useCallback } from 'react';
import { IoMdDownload } from 'react-icons/io';
import { compareString, compareNumber, listToMap, isDefined, isNotDefined } from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import Button from '#components/Button';
import MultiSelectInput from '#components/MultiSelectInput';
import Numeral from '#components/Numeral';
import RegionSelector from '#components/RegionSelector';
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
    programs: number[];

    indicators: number[];
    onIndicatorsChange: (value: number[] | ((v: number[]) => number[])) => void;

    regionLevel: RegionLevelOption;
    onRegionLevelChange: (v: RegionLevelOption) => void;

    indicatorList: Indicator[] | undefined;
    indicatorListPending: boolean | undefined;
}
function RegionTable(props: Props) {
    const {
        programs,
        regionLevel,
        onRegionLevelChange,
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
        programs,
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
                createColumn(numberColumn, 'allocatedBudget', 'Allocated Budget'),
                createColumn(numberColumn, 'componentCount', '# of components'),
                createColumn(numberColumn, 'programCount', '# of programs'),
                createColumn(numberColumn, 'partnerCount', '# of partners'),
                createColumn(numberColumn, 'sectorCount', '# of sectors'),
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
                valueType: 'number',
            });


            const dynamicColumns = validSelectedIndicators.map(id => createColumn(
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
                <RegionSelector
                    onRegionLevelChange={onRegionLevelChange}
                    regionLevel={regionLevel}
                    searchHidden
                />
                <MultiSelectInput
                    label="Indicators"
                    placeholder={`Select from ${indicatorList?.length || 0} indicators`}
                    options={indicatorList}
                    onChange={onIndicatorsChange}
                    value={validSelectedIndicators}
                    optionLabelSelector={indicatorTitleSelector}
                    optionKeySelector={indicatorKeySelector}
                    groupKeySelector={indicatorGroupKeySelector}
                    dropdownContainerClassName={styles.dropdown}
                    pending={indicatorListPending}
                />
                <Button
                    onClick={handleDownload}
                    icons={(
                        <IoMdDownload />
                    )}
                    disabled={!sortedFiveW || !orderedColumns}
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
