import React, { useState, useCallback } from 'react';
import { isFalsyString } from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import Button from '#components/Button';
import PolyChart from '#components/PolyChart';
import ChartModal from '#components/ChartModal';
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

    return (
        <>
            <div className={styles.tableActions}>
                <Button
                    onClick={handleModalShow}
                >
                    Add chart
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
                        className={styles.chart}
                        data={extendedPrograms}
                        settings={item}
                        onDelete={handleChartDelete}
                    />
                ))}
            </div>
            {showModal && (
                <ChartModal
                    onClose={handleModalClose}
                    onSave={handleChartAdd}
                    options={staticOptions}
                    keySelector={keySelector}
                />
            )}
        </>
    );
}
export default Charts;
