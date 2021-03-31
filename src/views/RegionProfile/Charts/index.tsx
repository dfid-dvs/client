import React, { useCallback, useState, useMemo } from 'react';
import {
    _cs,
    isFalsyString,
} from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import PolyChart from '#components/PolyChart';
import ChartModal from '#components/ChartModal';
import Modal from '#components/Modal';

import {
    ChartSettings,
    NumericOption,
} from '#types';

import useExtendedPrograms, { ExtendedProgram } from '../../Dashboard/useExtendedPrograms';

import styles from './styles.css';

const keySelector = (item: ExtendedProgram) => item.name;

const staticOptions: NumericOption<ExtendedProgram>[] = [
    {
        key: 'allocatedBudget',
        title: 'Total Budget',
        valueSelector: item => item.totalBudget,
        category: 'DFID Data',
    },
];

interface ProfileChartData {
    name: string;
    totalBudget: number;
    id: number;
}

const defaultChartSettings: ChartSettings<ExtendedProgram | ProfileChartData>[] = [
    {
        id: 'topProgramByBudget',
        type: 'bar-chart',
        title: 'Top Program by Budget',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.totalBudget,
        },

        bars: [
            {
                key: 'totalBudget',
                title: 'Total Budget',
                color: '#4C6AA9',
                valueSelector: item => item.totalBudget,
            },
        ],
    },
    {
        id: 'activeSectors',
        type: 'pie-chart',
        title: 'Top Sectors by Budget',
        key: 'totalBudget',
        keySelector: item => item.name,
        valueSelector: item => item.totalBudget,
    },
    {
        id: 'topPartnerByBudget',
        type: 'bar-chart',
        title: 'Top Partner by Budget',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.totalBudget,
        },

        bars: [
            {
                key: 'totalBudget',
                title: 'Total Budget',
                color: '#4C6AA9',
                valueSelector: item => item.totalBudget,
            },
        ],
    },
];

interface Props {
    className?: string;
    showAddModal: boolean;
    printMode: boolean;
    onAddModalVisibilityChange: (value: boolean) => void;
    activeSectors: ProfileChartData[] | undefined;
    topProgramByBudget: ProfileChartData[] | undefined;
    topPartnerByBudget: ProfileChartData[] | undefined;
}

function RegionalProfileCharts(props: Props) {
    const {
        className,
        showAddModal,
        onAddModalVisibilityChange,
        printMode,
        activeSectors,
        topProgramByBudget,
        topPartnerByBudget,
    } = props;
    const [
        chartSettings,
        setChartSettings,
    ] = useState<ChartSettings<ExtendedProgram | ProfileChartData>[]>(
        defaultChartSettings,
    );

    const [editableChartId, setEditableChartId] = useState<string>();
    const handleModalClose = useCallback(() => {
        onAddModalVisibilityChange(false);
        setEditableChartId(undefined);
    }, [onAddModalVisibilityChange, setEditableChartId]);

    const handleChartAdd = useCallback(
        (settings: ChartSettings<ExtendedProgram | ProfileChartData>) => {
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
        [editableChartId, chartSettings],
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

    const [programsPending, extendedPrograms] = useExtendedPrograms([]);

    const editableChartSettings: ChartSettings<ExtendedProgram> | undefined = useMemo(
        () => {
            const chartSetting = chartSettings.find(c => c.id === editableChartId);
            if (!chartSetting) {
                return undefined;
            }

            return chartSetting;
        },
        [chartSettings, editableChartId],
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
            onAddModalVisibilityChange(true);
        },
        [setEditableChartId, onAddModalVisibilityChange],
    );

    const handleChartCollapse = useCallback(
        () => {
            setExpandableChart(undefined);
        },
        [setExpandableChart],
    );

    const expandableChartSettings: ChartSettings<ExtendedProgram> | undefined = useMemo(
        () => {
            const chartSetting = chartSettings.find(c => c.id === expandableChart);
            if (!chartSetting) {
                return undefined;
            }
            return chartSetting;
        },
        [chartSettings, expandableChart],
    );

    const chartData = { activeSectors, topProgramByBudget, topPartnerByBudget };

    return (
        <div className={_cs(styles.charts, className)}>
            {programsPending && (
                <Backdrop className={styles.backdrop}>
                    <LoadingAnimation />
                </Backdrop>
            )}
            {chartSettings.map(item => (
                <PolyChart
                    key={item.id}
                    className={styles.chartContainer}
                    chartClassName={styles.chart}
                    hideActions={printMode}
                    data={chartData[item.id]}
                    settings={item}
                    onDelete={handleChartDelete}
                    onExpand={handleChartExpand}
                    chartExpanded={expandableChart}
                    // onSetEditableChartId={onSetEditableChartId}
                />
            ))}
            {showAddModal && (
                <ChartModal
                    onClose={handleModalClose}
                    onSave={handleChartAdd}
                    options={staticOptions}
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
                        data={extendedPrograms}
                        settings={expandableChartSettings}
                        onDelete={handleChartDelete}
                        className={styles.polyChart}
                        onExpand={handleChartExpand}
                        chartExpanded={expandableChart}
                    />
                </Modal>
            )}
        </div>
    );
}

export default RegionalProfileCharts;
