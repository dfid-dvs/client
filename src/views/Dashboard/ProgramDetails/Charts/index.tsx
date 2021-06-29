import React, { useState, useCallback, useMemo } from 'react';
import { isFalsyString } from '@togglecorp/fujs';
import { IoMdAddCircleOutline } from 'react-icons/io';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import Button from '#components/Button';
import PolyChart from '#components/PolyChart';
import ChartModal from '#components/ChartModal';
import Modal from '#components/Modal';

import { tableauColors } from '#utils/constants';
import {
    ChartSettings,
    NumericOption,
} from '#types';

import useExtendedPrograms, { ExtendedProgram } from '../../useExtendedPrograms';

import styles from './styles.css';

const keySelector = (item: ExtendedProgram) => item.name;

const staticOptions: NumericOption<ExtendedProgram>[] = [
    {
        key: 'totalBudget',
        title: 'Total Budget',
        valueSelector: item => item.totalBudget,
        category: 'BEK Data',
    },
    {
        key: 'componentCount',
        title: 'Component Count',
        valueSelector: item => item.componentCount,
        category: 'BEK Data',
    },
    {
        key: 'partnerCount',
        title: 'Partners',
        valueSelector: item => item.partnerCount,
        category: 'BEK Data',
    },
    {
        key: 'sectorCount',
        title: 'Sectors',
        valueSelector: item => item.sectorCount,
        category: 'BEK Data',
    },
];

const defaultChartSettings: ChartSettings<ExtendedProgram>[] = [
    {
        id: '1',
        type: 'bar-chart',
        title: 'Top 10 by budget',
        acronymSelector: item => item.programAcronym,
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.totalBudget,
        },

        bars: [
            {
                key: 'totalBudget',
                title: 'Budget Spend',
                color: tableauColors[1],
                valueSelector: item => item.totalBudget,
            },
        ],
    },
    {
        id: '2',
        type: 'bar-chart',
        title: 'Top 10 by components count',
        keySelector: item => item.name,
        acronymSelector: item => item.programAcronym,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.componentCount,
        },

        bars: [
            {
                key: 'componentCount',
                title: 'Components',
                color: tableauColors[5],
                valueSelector: item => item.componentCount,
            },
        ],
    },
    {
        id: '3',
        type: 'histogram',
        title: 'Budget distribution',
        color: tableauColors[0],
        binCount: 10,
        key: 'totalBudget',
        valueSelector: item => item.totalBudget,
    },
];

interface Props {
    programs: number[];
}

function Charts(props: Props) {
    const {
        programs,
    } = props;

    const [programsPending, extendedPrograms] = useExtendedPrograms(programs);

    const [chartSettings, setChartSettings] = useState<ChartSettings<ExtendedProgram>[]>(
        defaultChartSettings,
    );

    const [showModal, setModalVisibility] = useState(false);
    const [editableChartId, setEditableChartId] = useState<string>();

    const handleModalShow = useCallback(() => {
        setModalVisibility(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setModalVisibility(false);
        setEditableChartId(undefined);
    }, []);

    const handleChartAdd = useCallback(
        (settings: ChartSettings<ExtendedProgram>) => {
            const settingsWithAcronym = {
                ...settings,
                acronymSelector: (item: ExtendedProgram) => item.programAcronym,
            };

            if (!editableChartId) {
                setChartSettings(currentChartSettings => [
                    ...currentChartSettings,
                    settingsWithAcronym,
                ]);
            }
            const tmpChartSettings = [...chartSettings];
            const chartIndex = tmpChartSettings.findIndex(c => c.id === editableChartId);
            if (chartIndex <= -1) {
                return;
            }
            tmpChartSettings.splice(chartIndex, 1, settingsWithAcronym);
            setChartSettings(tmpChartSettings);
        },
        [editableChartId, chartSettings, setChartSettings],
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

    const [expandableChart, setExpandableChart] = useState<string>();

    const handleChartExpand = useCallback(
        (id: string | undefined) => {
            setExpandableChart(id);
        },
        [],
    );

    const handleChartCollapse = useCallback(
        () => {
            setExpandableChart(undefined);
        },
        [],
    );

    const onSetEditableChartId = useCallback(
        (id: string | undefined) => {
            setEditableChartId(id);
            setModalVisibility(true);
        },
        [],
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
    return (
        <>
            <div className={styles.tableActions}>
                <Button
                    onClick={handleModalShow}
                    className={styles.addChartButton}
                    icons={<IoMdAddCircleOutline className={styles.icon} />}
                    transparent
                >
                    Add Chart
                </Button>
            </div>
            <div className={styles.charts}>
                {programsPending && (
                    <Backdrop className={styles.backdrop}>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                {!programsPending && chartSettings.map(item => (
                    <PolyChart
                        key={item.id}
                        chartClassName={styles.chart}
                        data={extendedPrograms}
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
        </>
    );
}
export default Charts;
