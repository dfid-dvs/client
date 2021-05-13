import React, { useMemo, useState, useCallback } from 'react';
import { isDefined, unique, listToMap, isFalsyString } from '@togglecorp/fujs';
import { IoMdAddCircleOutline } from 'react-icons/io';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import Button from '#components/Button';
import PolyChart from '#components/PolyChart';
import ChartModal from '#components/ChartModal';
import Modal from '#components/Modal';

import { tableauColors } from '#utils/constants';
import {
    Indicator,
    RegionLevelOption,
    ChartSettings,
    NumericOption,
} from '#types';

import useExtendedFiveW, { ExtendedFiveW } from '../../useExtendedFiveW';
import styles from './styles.css';

const keySelector = (item: ExtendedFiveW) => item.name;

const staticOptions: NumericOption<ExtendedFiveW>[] = [
    {
        key: 'allocatedBudget',
        title: 'Budget Spend',
        valueSelector: item => item.allocatedBudget,
        category: 'DFID Data',
    },
    {
        key: 'programCount',
        title: 'Programs',
        valueSelector: item => item.programCount,
        category: 'DFID Data',
    },
    {
        key: 'componentCount',
        title: 'Components',
        valueSelector: item => item.componentCount,
        category: 'DFID Data',
    },
    {
        key: 'partnerCount',
        title: 'Partners',
        valueSelector: item => item.partnerCount,
        category: 'DFID Data',
    },
    {
        key: 'sectorCount',
        title: 'Sectors',
        valueSelector: item => item.sectorCount,
        category: 'DFID Data',
    },
];

const defaultChartSettings: ChartSettings<ExtendedFiveW>[] = [
    {
        id: '1',
        type: 'bar-chart',
        title: 'Top 10 by budget',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.allocatedBudget,
        },

        bars: [
            {
                title: 'Budget Spend',
                key: 'allocatedBudget',
                color: tableauColors[1],
                valueSelector: item => item.allocatedBudget,
            },
        ],
    },
    {
        id: '1.1',
        type: 'bar-chart',
        title: 'Top 10 by programs',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.programCount,
        },

        bars: [
            {
                key: 'programCount',
                title: 'Program count',
                color: tableauColors[2],
                valueSelector: item => item.programCount,
            },
        ],
    },
    {
        id: '1.2',
        type: 'bar-chart',
        title: 'Top 10 by partners',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.partnerCount,
        },

        bars: [
            {
                key: 'partnerCount',
                title: 'Partner count',
                color: tableauColors[3],
                valueSelector: item => item.partnerCount,
            },
        ],
    },
    {
        id: '1.3',
        type: 'bar-chart',
        title: 'Top 10 by sectors',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.sectorCount,
        },

        bars: [
            {
                key: 'sectorCount',
                title: 'Sector count',
                color: tableauColors[4],
                valueSelector: item => item.sectorCount,
            },
        ],
    },
    /* {
        id: '2',
        type: 'bar-chart',
        title: 'Top 10 by population',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.indicators[25] || null,
        },

        bars: [
            {
                title: 'Population',
                color: tableauColors[5],
                valueSelector: item => item.indicators[25] || null,
            },
        ],
        dependencies: [25],
    },
    {
        id: '3',
        type: 'bar-chart',
        title: 'Top 10 by poverty incidence',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.indicators[132] || null,
        },

        bars: [
            {
                title: 'Poverty Incidence',
                color: tableauColors[6],
                valueSelector: item => item.indicators[132] || null,
            },
        ],
        dependencies: [132],
    }, */
    {
        id: '2',
        type: 'pie-chart',
        key: 'allocatedBudget',
        title: 'Total Budget',
        keySelector: item => item.name,
        valueSelector: item => item.allocatedBudget,
    },
    {
        id: '4',
        type: 'histogram',
        key: 'componentCount',
        title: 'Component Count',
        color: tableauColors[0],
        binCount: 10,
        valueSelector: item => item.componentCount,
        // dependencies: [118],
    },
    {
        id: '3',
        type: 'bi-axial-chart',
        title: 'Health and Finance for top 10 by budget',
        keySelector: item => item.name,
        chartData: [
            {
                type: 'bar',
                title: 'Program count',
                key: 'programCount',
                color: tableauColors[2],
                valueSelector: item => item.programCount,
            },
            {
                type: 'line',
                title: 'Budget Spend',
                key: 'allocatedBudget',
                color: tableauColors[4],
                valueSelector: item => item.allocatedBudget,
            },
        ],

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.programCount,
        },
        // meta
        dependencies: [119, 118],
    },
    {
        id: '5',
        type: 'scatter-chart',
        title: 'Health and Finance for top 10 by budget',
        keySelector: item => item.name,
        data: [
            {
                title: 'Program count',
                key: 'programCount',
                valueSelector: item => item.programCount,
            },
            {
                title: 'Budget Spend',
                key: 'allocatedBudget',
                valueSelector: item => item.allocatedBudget,
            },
        ],
        color: tableauColors[0],
    },
];

interface Props {
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

function Charts(props: Props) {
    const {
        regionLevel,
        indicatorList,
        indicatorListPending,

        markerIdList,
        submarkerIdList,
        programIdList,
        componentIdList,
        partnerIdList,
        sectorIdList,
        subsectorIdList,
    } = props;

    const [chartSettings, setChartSettings] = useState<ChartSettings<ExtendedFiveW>[]>(
        defaultChartSettings,
    );

    const [showModal, setModalVisibility] = useState(false);
    const [editableChartId, setEditableChartId] = useState<string>();
    const indicatorMapping = useMemo(
        () => listToMap(
            indicatorList,
            item => item.id,
            item => item,
        ),
        [indicatorList],
    );

    const options: NumericOption<ExtendedFiveW>[] = useMemo(
        () => {
            if (!indicatorList) {
                return staticOptions;
            }
            return [
                ...staticOptions,
                ...indicatorList.map(indicator => ({
                    key: `indicator_${indicator.id}`,
                    title: indicator.fullTitle,
                    // FIXME: zero zero zero
                    valueSelector: (item: ExtendedFiveW) => item.indicators[indicator.id] || 0,

                    category: indicator.category,

                    dependency: indicator.id,
                })),
            ];
        },
        [indicatorList],
    );

    // Valid indicators for chart
    const validSelectedIndicators = useMemo(
        () => unique(
            [...chartSettings
                .map(item => item.dependencies)
                .filter(isDefined)
                .flat(),
            ].filter(i => !!indicatorMapping[i]),
            item => item,
        ).sort(),
        [chartSettings, indicatorMapping],
    );

    const handleModalShow = useCallback(() => {
        setModalVisibility(true);
    }, [setModalVisibility]);

    const handleModalClose = useCallback(() => {
        setModalVisibility(false);
        setEditableChartId(undefined);
    }, [setModalVisibility, setEditableChartId]);

    const editableChartSettings: ChartSettings<ExtendedFiveW> | undefined = useMemo(
        () => {
            const chartSetting = chartSettings.find(c => c.id === editableChartId);
            if (!chartSetting) {
                return undefined;
            }

            return chartSetting;
        },
        [chartSettings, editableChartId],
    );
    const handleChartAdd = useCallback(
        (settings: ChartSettings<ExtendedFiveW>) => {
            if (!editableChartId) {
                setChartSettings(currentChartSettings => [
                    ...currentChartSettings,
                    settings,
                ]);
            }
            const tmpChartSettings = [...chartSettings];
            const chartIndex = tmpChartSettings.findIndex(c => c.id === editableChartId);
            if (chartIndex <= -1) {
                return;
            }
            tmpChartSettings.splice(chartIndex, 1, settings);
            setChartSettings(tmpChartSettings);
        },
        [editableChartId, setChartSettings, chartSettings],
    );

    const handleChartDelete = useCallback(
        (name: string | undefined) => {
            if (isFalsyString(name)) {
                return;
            }

            setChartSettings(currentChartSettings => (
                currentChartSettings.filter(item => item.id !== name)
            ));
        },
        [setChartSettings],
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

    const [expandableChart, setExpandableChart] = useState<string>();

    const handleChartExpand = useCallback(
        (id: string | undefined) => {
            setExpandableChart(id);
        },
        [setExpandableChart],
    );

    const onSetEditableChartId = useCallback(
        (id: string | undefined) => {
            setEditableChartId(id);
            setModalVisibility(true);
        },
        [setEditableChartId, setModalVisibility],
    );

    const handleChartCollapse = useCallback(
        () => {
            setExpandableChart(undefined);
        },
        [setExpandableChart],
    );

    const expandableChartSettings: ChartSettings<ExtendedFiveW> | undefined = useMemo(
        () => {
            const chartSetting = chartSettings.find(c => c.id === expandableChart);
            if (!chartSetting) {
                return undefined;
            }
            return chartSetting;
        },
        [chartSettings, expandableChart],
    );

    const loading = extendedFiveWPending || indicatorListPending;

    return (
        <>
            <div className={styles.tableActions}>
                <Button
                    onClick={handleModalShow}
                    className={styles.addChartButton}
                    icons={<IoMdAddCircleOutline className={styles.icon} />}
                    transparent
                    variant="outline"
                >
                    Add Chart
                </Button>
            </div>
            <div className={styles.charts}>
                {loading && (
                    <Backdrop className={styles.backdrop}>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                {!loading && chartSettings.map(item => (
                    <PolyChart
                        key={item.id}
                        chartClassName={styles.chart}
                        data={extendedFiveWList}
                        settings={item}
                        onDelete={handleChartDelete}
                        className={styles.polyChart}
                        onExpand={handleChartExpand}
                        chartExpanded={expandableChart}
                        onSetEditableChartId={onSetEditableChartId}
                    />
                ))}
            </div>
            {showModal && (
                <ChartModal
                    onClose={handleModalClose}
                    onSave={handleChartAdd}
                    options={options}
                    keySelector={keySelector}
                    editableChartSettings={editableChartSettings}
                />
            )}
            {expandableChart && expandableChartSettings && (
                <Modal
                    onClose={handleChartCollapse}
                    className={styles.modalChart}
                    header={expandableChartSettings.title}
                    headerClassName={styles.header}
                >
                    <PolyChart
                        chartClassName={styles.chart}
                        data={extendedFiveWList}
                        settings={expandableChartSettings}
                        onDelete={handleChartDelete}
                        className={styles.polyChart}
                        onExpand={handleChartExpand}
                        chartExpanded={expandableChart}
                    />
                </Modal>
            )}
        </>
    );
}
export default Charts;
