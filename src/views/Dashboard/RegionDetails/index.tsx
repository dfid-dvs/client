import React, { useMemo, useContext, useState, useEffect, useCallback } from 'react';
import { IoMdDownload } from 'react-icons/io';
import { compareString, compareNumber, listToMap, isDefined, isNotDefined } from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import Button from '#components/Button';
import SegmentInput from '#components/SegmentInput';
import DomainContext from '#components/DomainContext';
import MultiSelectInput from '#components/MultiSelectInput';
import Numeral from '#components/Numeral';
import PopupPage from '#components/PopupPage';
import RegionSelector from '#components/RegionSelector';
import Table, { createColumn } from '#components/Table';
import Cell from '#components/Table/Cell';
import HeaderCell from '#components/Table/HeaderCell';
import { SortDirection, FilterType } from '#components/Table/types';
import useDownloading, { convertTableData } from '#components/Table/useDownloading';
import useFiltering, { useFilterState } from '#components/Table/useFiltering';
import useOrdering, { useOrderState } from '#components/Table/useOrdering';
import useSorting, { useSortState } from '#components/Table/useSorting';

import useRequest from '#hooks/useRequest';
import {
    MultiResponse,
    Indicator,
} from '#types';

import { ExtractKeys } from '#utils/common';
import { apiEndPoint } from '#utils/constants';

import useMapStateForFiveW from '../useMapStateForFiveW';
import { FiveW } from '../types';

import Charts from './Charts';
import Sankey from './Sankey';

import styles from './styles.css';

// TODO: move sankey, charts, table in different pages with their own request handling

type TabOptionKeys = 'table' | 'charts' | 'sankey';
interface TabOption {
    key: TabOptionKeys;
    label: string;
}
const tabOptions: TabOption[] = [
    { key: 'table', label: 'Table' },
    { key: 'charts', label: 'Charts' },
    { key: 'sankey', label: 'Sankey' },
];

interface Node {
    name: string;
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
    { name: 'componentCount' },
    { name: 'partnerCount' },
    { name: 'sectorCount' },
];

const fiveWKeySelector = (data: FiveW) => data.id;
const indicatorTitleSelector = (indicator: Indicator) => indicator.fullTitle;
const indicatorKeySelector = (indicator: Indicator) => indicator.id;
const indicatorGroupKeySelector = (indicator: Indicator) => indicator.category;

interface IndicatorValue {
    indicatorId: number;
    code: string;
    value: number;
}

interface RegionDetailsProps {
    className?: string;
    indicatorList: Indicator[] | undefined;
    indicatorListPending: boolean | undefined;
}

interface ExtendedFiveW extends FiveW {
    indicators: {
        [key: number]: number | undefined;
    };
}

function RegionDetails(props: RegionDetailsProps) {
    const {
        className,
        indicatorList,
        indicatorListPending,
    } = props;

    const { regionLevel: regionLevelFromContext, programs } = useContext(DomainContext);

    const [regionLevel, setRegionLevel] = useState(regionLevelFromContext);
    const [selectedTab, setSelectedTab] = useState<TabOptionKeys>('table');

    const [
        selectedRegions,
        setSelectedRegions,
    ] = useState<number[]>([]);

    const [
        fiveWMapStatePending,
        fiveW,
    ] = useMapStateForFiveW(regionLevel, programs);

    const [selectedIndicators, setSelectedIndicators] = useState<number[]>([]);

    const indicatorMapping = useMemo(
        () => listToMap(
            indicatorList,
            item => item.id,
            item => item,
        ),
        [indicatorList],
    );

    const validSelectedIndicators = useMemo(
        () => selectedIndicators.filter(i => !!indicatorMapping[i]),
        [selectedIndicators, indicatorMapping],
    );

    const allValidSelectedInidcators = useMemo(
        () => selectedIndicators.filter(i => !!indicatorMapping[i]),
        [selectedIndicators, indicatorMapping],
    );

    const options: RequestInit | undefined = useMemo(
        () => (allValidSelectedInidcators ? {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                indicatorId: allValidSelectedInidcators,
            }),
        } : undefined),
        [allValidSelectedInidcators],
    );

    let regionIndicatorUrl: string | undefined;
    if (allValidSelectedInidcators.length > 0) {
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
                    allValidSelectedInidcators,
                    id => id,
                    id => mapping[`${item.code}-${id}`],
                ),
            }));
        },
        [fiveW, regionIndicatorListResponse, allValidSelectedInidcators],
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
                const newItems: ColumnOrderingItem[] = selectedIndicators
                    ?.filter(selectedIndicator => (
                        !oldIndicators.has(selectedIndicator)
                    )).map(item => ({
                        name: getIndicatorHeaderName(item),
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
    const filteredFiveW = useFiltering(filtering, orderedColumns, finalFiveW);
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
        <PopupPage
            className={className}
            title="Regions"
            parentLink="/dashboard/"
            parentName="dashboard"
            actions={(
                <div className={styles.tabActions}>
                    <SegmentInput
                        options={tabOptions}
                        optionKeySelector={item => item.key}
                        optionLabelSelector={item => item.label}
                        value={selectedTab}
                        onChange={setSelectedTab}
                    />
                </div>
            )}
        >
            {selectedTab === 'table' && (
                <>
                    <div className={styles.tableActions}>
                        <RegionSelector
                            onRegionLevelChange={setRegionLevel}
                            regionLevel={regionLevel}
                            searchHidden
                        />
                        <MultiSelectInput
                            label="Indicators"
                            placeholder={`Select from ${indicatorList?.length || 0} indicators`}
                            options={indicatorList}
                            onChange={setSelectedIndicators}
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
                    <div className={styles.table}>
                        {(fiveWMapStatePending || regionIndicatorListPending) && (
                            <Backdrop>
                                <LoadingAnimation />
                            </Backdrop>
                        )}
                        <Table
                            className={styles.table}
                            data={finalFiveW}
                            keySelector={fiveWKeySelector}
                            columns={orderedColumns}
                        />
                    </div>
                </>
            )}
            {selectedTab === 'charts' && (
                <Charts
                    programs={programs}
                    regionLevel={regionLevel}
                    onRegionLevelChange={setRegionLevel}
                    indicatorMapping={indicatorMapping}
                />
            )}
            {selectedTab === 'sankey' && (
                <Sankey
                    programs={programs}
                    regions={selectedRegions}
                    onRegionsChange={setSelectedRegions}
                />
            )}
        </PopupPage>
    );
}

export default RegionDetails;
