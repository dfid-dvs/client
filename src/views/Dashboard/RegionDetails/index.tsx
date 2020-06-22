import React, { useMemo, useContext, useState, useEffect, useCallback } from 'react';
import { IoMdDownload } from 'react-icons/io';
import { compareString, compareNumber, listToMap, isDefined, isNotDefined, unique, isTruthyString } from '@togglecorp/fujs';

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

import useMapStateForFiveW from '../useMapStateForFiveW';
import { FiveW } from '../types';

import Chart, { ChartSettings, BarChartSettings } from './Chart';

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

interface RegionDetailsProps {
    className?: string;
    indicatorList: Indicator[] | undefined;
}

interface ExtendedFiveW extends FiveW {
    indicators: {
        [key: number]: number | undefined;
    };
}

const one: BarChartSettings<ExtendedFiveW> = {
    type: 'bar-chart',
    title: 'Top 10 budget spend',
    id: 'budget-information',
    keySelector: item => item.name,
    // layout: 'horizontal',

    limit: {
        count: 10,
        method: 'max',
        valueSelector: item => item.allocatedBudget,
    },

    bars: [
        {
            title: 'Allocated Budget',
            color: 'purple',
            valueSelector: item => item.allocatedBudget,
        },
    ],
};
const two: BarChartSettings<ExtendedFiveW> = {
    type: 'bar-chart',
    title: 'Health and Finance for Top 10 budget spend',
    id: 'financial-information',
    keySelector: item => item.name,
    // layout: 'horizontal',
    bars: [
        {
            title: 'Health Facilities',
            color: 'red',
            valueSelector: item => item.indicators[119] || null,
        },
        {
            title: 'Financial Institutions',
            color: 'blue',
            valueSelector: item => item.indicators[118] || null,
        },
    ],

    limit: {
        count: 10,
        method: 'max',
        valueSelector: item => item.allocatedBudget,
    },

    // meta
    dependencies: [119, 118],
};
const twopointfive: BarChartSettings<ExtendedFiveW> = {
    type: 'bar-chart',
    title: 'Bottom 10 budget spend',
    id: 'budget-information',
    keySelector: item => item.name,
    // layout: 'horizontal',

    limit: {
        count: 10,
        method: 'min',
        valueSelector: item => item.allocatedBudget,
    },

    bars: [
        {
            title: 'Allocated Budget',
            color: 'purple',
            valueSelector: item => item.allocatedBudget,
        },
    ],
};
const three: BarChartSettings<ExtendedFiveW> = {
    type: 'bar-chart',
    title: 'Health and Finance for Bottom 10 budget spend',
    id: 'financial-information-stacked',
    keySelector: item => item.name,
    // layout: 'horizontal',
    bars: [
        {
            title: 'Health Facilities',
            color: 'red',
            valueSelector: item => item.indicators[119] || null,
            stackId: 'facilities',
        },
        {
            title: 'Financial Institutions',
            color: 'blue',
            valueSelector: item => item.indicators[118] || null,
            stackId: 'facilities',
        },
    ],

    limit: {
        count: 10,
        method: 'min',
        valueSelector: item => item.allocatedBudget,
    },

    dependencies: [119, 118],
};

const defaultChartSettings = [
    one, two, twopointfive, three,
];
const defaultIndicators: number[] = [];

/*
const defaultIndicators = [
    119,
    118,
];
const defaultChartSettings: ChartSettings<ExtendedFiveW>[] = [];
*/

function RegionDetails(props: RegionDetailsProps) {
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

    const [selectedIndicators, setSelectedIndicators] = useState<number[]>(
        defaultIndicators,
    );
    const [chartSettings, setChartSettings] = useState<ChartSettings<ExtendedFiveW>[]>(
        defaultChartSettings,
    );

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

    // FIXME: get unique values from valid selected indicators too
    const allValidSelectedInidcators = useMemo(
        () => unique(
            [
                ...selectedIndicators,
                ...chartSettings
                    .map(item => item.dependencies)
                    .filter(isDefined)
                    .flat(),
            ].filter(i => !!indicatorMapping[i]),
            item => item,
        ).sort(),
        [selectedIndicators, indicatorMapping, chartSettings],
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
                    </div>
                    <Table
                        className={styles.table}
                        data={finalFiveW}
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
                        <Button
                            onClick={handleModalShow}
                            disabled
                        >
                            Add chart
                        </Button>
                    </div>
                    <div className={styles.charts}>
                        {chartSettings.map(item => (
                            <Chart
                                className={styles.chart}
                                key={item.id}
                                data={sortedFiveW}
                                settings={item}
                            />
                        ))}
                    </div>
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

export default RegionDetails;
