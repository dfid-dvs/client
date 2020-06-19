import React, { useMemo, useContext, useState, useEffect, useCallback } from 'react';
import { IoMdDownload } from 'react-icons/io';
import { compareString, compareNumber, listToMap, isDefined, isNotDefined, isTruthyString } from '@togglecorp/fujs';

import Button from '#components/Button';
import SegmentInput from '#components/SegmentInput';
import BudgetFlowSankey from '#components/BudgetFlowSankey';
import DomainContext from '#components/DomainContext';
import Modal from '#components/Modal';
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
    SankeyData,
} from '#types';

import { ExtractKeys, prepareUrlParams as p } from '#utils/common';
import { apiEndPoint } from '#utils/constants';

import useMapStateForFiveW from '../../useMapStateForFiveW';
import { FiveW } from '../../types';

import styles from './styles.css';

// TODO: move sankey and table in different pages with their own request handling

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
    type: 'string' | 'number';
}
const staticColumnOrdering: ColumnOrderingItem[] = [
    { name: 'name', type: 'string' },
    { name: 'allocatedBudget', type: 'number' },
];

const sankeyColorSelector = (item: { depth: number }) => ['red', 'blue', 'green'][item.depth];
const sankeyNameSelector = (item: { name: string }) => item.name;
const fiveWKeySelector = (data: FiveW) => data.id;
const indicatorTitleSelector = (indicator: Indicator) => indicator.fullTitle;
const indicatorKeySelector = (indicator: Indicator) => indicator.id;
const indicatorGroupKeySelector = (indicator: Indicator) => indicator.category;

interface IndicatorValue {
    indicatorId: number;
    code: string;
    value: number;
}

interface RegionWiseTableProps {
    className?: string;
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
        indicatorList,
    } = props;

    const { regionLevel: regionLevelFromContext, programs } = useContext(DomainContext);
    const [regionLevel, setRegionLevel] = useState(regionLevelFromContext);
    const [selectedTab, setSelectedTab] = useState<TabOptionKeys>('table');
    const [showModal, setModalVisibility] = useState(false);

    const [
        selectedRegions,
        setSelectedRegions,
    ] = useState<number[]>([]);

    const [
        fiveWMapStatePending,
        fiveWMapState,
        fiveW,
    ] = useMapStateForFiveW(regionLevel, programs);

    const handleModalShow = useCallback(() => {
        setModalVisibility(true);
    }, [setModalVisibility]);

    const handleModalClose = useCallback(() => {
        setModalVisibility(false);
    }, [setModalVisibility]);

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

    const params = p({
        program: programs,
        province: selectedRegions,
    });

    const sankeyUrl = isTruthyString(params)
        ? `${apiEndPoint}/core/sankey-region/?${params}`
        : `${apiEndPoint}/core/sankey-region/`;

    const [
        sankeyPending,
        sankeyResponse,
    ] = useRequest<SankeyData<Node>>(sankeyUrl, 'sankey-data');

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
                        <Button
                            onClick={handleModalShow}
                        >
                            Add chart
                        </Button>
                    </div>
                    <Table
                        className={styles.table}
                        data={sortedFiveW}
                        keySelector={fiveWKeySelector}
                        columns={orderedColumns}
                    />
                    {showModal && (
                        <Modal onClose={handleModalClose}>
                            This is the body
                        </Modal>
                    )}
                </>
            )}
            {selectedTab === 'charts' && (
                <>
                    <div className={styles.tableActions}>
                        <RegionSelector
                            onRegionLevelChange={setRegionLevel}
                            regionLevel={regionLevel}
                            searchHidden
                        />
                    </div>
                    <div className={styles.charts} />
                </>
            )}
            {selectedTab === 'sankey' && (
                <>
                    <div className={styles.tableActions}>
                        <RegionSelector
                            onRegionLevelChange={setRegionLevel}
                            regionLevel="province"
                            selectionHidden
                            regions={selectedRegions}
                            onRegionsChange={setSelectedRegions}
                        />
                    </div>
                    <div className={styles.sankey}>
                        <BudgetFlowSankey
                            data={sankeyResponse}
                            colorSelector={sankeyColorSelector}
                            nameSelector={sankeyNameSelector}
                        />
                    </div>
                </>
            )}
        </PopupPage>
    );
}

export default RegionWiseTable;
