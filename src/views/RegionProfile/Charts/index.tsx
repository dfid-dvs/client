import React, { useCallback, useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

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
    key: string;
    id: number;
    value: number;
}

const defaultChartSettings: ChartSettings<ProfileChartData>[] = [
    {
        id: 'topProgramByBudget',
        type: 'bar-chart',
        title: 'Top Program by Budget',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.value,
        },

        bars: [
            {
                key: 'totalBudget',
                title: 'Total Budget',
                color: '#4C6AA9',
                valueSelector: item => item.value,
            },
        ],
    },
    {
        id: 'activeSectors',
        type: 'pie-chart',
        title: 'Top Sectors by Budget',
        key: 'totalBudget',
        keySelector: item => item.name,
        valueSelector: item => item.value,
    },
    {
        id: 'topPartnerByBudget',
        type: 'bar-chart',
        title: 'Top Partner by Budget',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.value,
        },

        bars: [
            {
                key: 'totalBudget',
                title: 'Total Budget',
                color: '#4C6AA9',
                valueSelector: item => item.value,
            },
        ],
    },

    {
        id: 'topSectorByNoOfPartner',
        type: 'bar-chart',
        title: 'Top Sectors by number of partners',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.value,
        },

        bars: [
            {
                key: 'partnerCount',
                title: 'Partner Count',
                color: '#4C6AA9',
                valueSelector: item => item.value,
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
    topSectorByNoOfPartner: ProfileChartData[] | undefined;
    hiddenChartIds: string[] | undefined;
    handleAddHideableChartIds: (id: string | undefined) => void;
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
        topSectorByNoOfPartner,
        hiddenChartIds,
        handleAddHideableChartIds,
    } = props;
    const [
        chartSettings,
        setChartSettings,
    ] = useState<ChartSettings<ExtendedProgram>[]>();

    const showableChartSettings = useMemo(
        () => {
            if (!hiddenChartIds) {
                return chartSettings;
            }
            return chartSettings?.filter(c => !hiddenChartIds.includes(c.id));
        },
        [chartSettings, hiddenChartIds],
    );

    const [editableChartId, setEditableChartId] = useState<string>();
    const handleModalClose = useCallback(() => {
        onAddModalVisibilityChange(false);
        setEditableChartId(undefined);
    }, [onAddModalVisibilityChange, setEditableChartId]);

    const handleChartAdd = useCallback(
        (settings: ChartSettings<ExtendedProgram>) => {
            
            if (!chartSettings) {
                return;
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

    const [programsPending, extendedPrograms] = useExtendedPrograms([]);

    const editableChartSettings: ChartSettings<ExtendedProgram> | undefined = useMemo(
        () => {
            const chartSetting = chartSettings?.find(c => c.id === editableChartId);
            if (!chartSetting) {
                return undefined;
            }

            return chartSetting;
        },
        [chartSettings, editableChartId],
    );

    const [expandableDefaultChart, setExpandableDefaultChart] = useState<string>();
    const handleDefaultChartExpand = useCallback(
        (id: string | undefined) => {
            setExpandableDefaultChart(id);
        },
        [setExpandableDefaultChart],
    );

    const handleDefaultChartCollapse = useCallback(
        () => {
            setExpandableDefaultChart(undefined);
        },
        [setExpandableDefaultChart],
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

    const defaultChartData = {
        activeSectors,
        topProgramByBudget,
        topPartnerByBudget,
        topSectorByNoOfPartner,
    };

    const expandableChartSettings = useMemo(
        () => {
            const chartSetting = chartSettings?.find(c => c.id === expandableChart);
            if (!chartSetting) {
                return undefined;
            }
            return chartSetting;
        },
        [chartSettings, expandableChart],
    );

    const expandableDefaultChartSettings = useMemo(
        () => {
            const chartSetting = defaultChartSettings.find(c => c.id === expandableDefaultChart);
            if (!chartSetting) {
                return undefined;
            }
            return chartSetting;
        },
        [expandableDefaultChart],
    );

    return (
        <div className={_cs(styles.charts, className)}>
            {programsPending && (
                <Backdrop className={styles.backdrop}>
                    <LoadingAnimation />
                </Backdrop>
            )}
            {defaultChartSettings.map(item => (
                <PolyChart
                    key={item.id}
                    className={styles.chartContainer}
                    chartClassName={styles.chart}
                    hideActions={printMode}
                    data={defaultChartData[item.id]}
                    settings={item}
                    onDelete={handleAddHideableChartIds}
                    onExpand={handleDefaultChartExpand}
                    chartExpanded={expandableDefaultChart}
                />
            ))}
            {showableChartSettings?.map(item => (
                <PolyChart
                    key={item.id}
                    className={styles.chartContainer}
                    chartClassName={styles.chart}
                    hideActions={printMode}
                    data={extendedPrograms}
                    settings={item}
                    onDelete={handleAddHideableChartIds}
                    onExpand={handleChartExpand}
                    chartExpanded={expandableChart}
                    onSetEditableChartId={onSetEditableChartId}
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
            {expandableDefaultChart && expandableDefaultChartSettings && (
                <Modal
                    onClose={handleDefaultChartCollapse}
                    className={styles.modalChart}
                    header={expandableDefaultChartSettings.title}
                    headerClassName={styles.header}
                >
                    <PolyChart
                        chartClassName={styles.chart}
                        data={defaultChartData[expandableDefaultChart]}
                        settings={expandableDefaultChartSettings}
                        onDelete={handleAddHideableChartIds}
                        className={styles.polyChart}
                        onExpand={handleDefaultChartCollapse}
                        chartExpanded={expandableDefaultChart}
                    />
                </Modal>
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
                        onDelete={handleAddHideableChartIds}
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
