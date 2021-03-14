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
import { prepareUrlParams as p } from '#utils/common';

import useExtendedPrograms, { ExtendedProgram } from '../../useExtendedPrograms';

import styles from './styles.css';


const keySelector = (item: ExtendedProgram) => item.name;

const staticOptions: NumericOption<ExtendedProgram>[] = [
    {
        key: 'allocatedBudget',
        title: 'Allocated Budget',
        valueSelector: item => item.totalBudget,
        category: 'DFID Data',
    },
];

const defaultChartSettings: ChartSettings<ExtendedProgram>[] = [
    {
        id: '1',
        type: 'bar-chart',
        title: 'Top 10 by budget',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.totalBudget,
        },

        bars: [
            {
                key: 'totalBudget',
                title: 'Allocated Budget',
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
    const [hoveredChartId, setHoveredChartId] = useState<string>();
    const onHoverChart = useCallback(
        (id: string) => {
            setHoveredChartId(id);
        },
        [setHoveredChartId],
    );

    const onLeaveChart = useCallback(
        () => {
            setHoveredChartId(undefined);
        },
        [setHoveredChartId],
    );
    const handleModalShow = useCallback(() => {
        setModalVisibility(true);
    }, [setModalVisibility]);

    const handleModalClose = useCallback(() => {
        setModalVisibility(false);
    }, [setModalVisibility]);

    const handleChartAdd = useCallback(
        (settings: ChartSettings<ExtendedProgram>) => {
            setChartSettings(currentChartSettings => [
                ...currentChartSettings,
                settings,
            ]);
        },
        [],
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
        [],
    );

    const [expandableChart, setExpandableChart] = useState<string>();

    const handleChartExpand = useCallback(
        (id: string | undefined) => {
            setExpandableChart(id);
        },
        [setExpandableChart],
    );

    const handleChartCollapse = useCallback(
        () => {
            setExpandableChart(undefined);
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
                    <div className={styles.text}>
                        Add Chart
                    </div>
                </Button>
            </div>
            <div className={styles.charts}>
                {programsPending && (
                    <Backdrop className={styles.backdrop}>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                {chartSettings.map(item => (
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
                        hoveredChartId={hoveredChartId}
                        onHoverChart={onHoverChart}
                        onLeaveChart={onLeaveChart}
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
