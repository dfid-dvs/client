import React, { useState, useCallback } from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import { TiChartPie } from 'react-icons/ti';
import { GiHistogram } from 'react-icons/gi';

import Modal from '#components/Modal';
import SegmentInput from '#components/SegmentInput';
import {
    Indicator,
} from '#types';


import { ChartSettings } from '../types';
import { ExtendedFiveW } from '../../../useExtendedFiveW';

import BarChartConfig from './BarChartConfig';
import PieChartConfig from './PieChartConfig';
import HistogramConfig from './HistogramConfig';
import styles from './styles.css';

type ChartType = 'bar-chart' | 'pie-chart' | 'histogram';

interface ChartTypeOption {
    type: ChartType;
    name: React.ReactNode;
}

const chartTypeOptions: ChartTypeOption[] = [
    {
        type: 'bar-chart',
        name: (
            <>
                <FiBarChart2 />
                &nbsp;
                Bar Chart
            </>
        ),
    },
    {
        type: 'pie-chart',
        name: (
            <>
                <TiChartPie />
                &nbsp;
                Pie Chart
            </>
        ),
    },
    {
        type: 'histogram',
        name: (
            <>
                <GiHistogram />
                &nbsp;
                Histogram
            </>
        ),
    },

];

const chartLabelSelector = (item: ChartTypeOption) => item.name;
const chartKeySelector = (item: ChartTypeOption) => item.type;

interface Props {
    onSave: (settings: ChartSettings<ExtendedFiveW>) => void;
    onClose: () => void;
    indicatorList: Indicator[] | undefined;
}

function ChartModal(props: Props) {
    const {
        onClose,
        onSave,
        indicatorList,
    } = props;

    const [chartType, setChartType] = useState<ChartType>('bar-chart');
    const handleSave = useCallback(
        (value: ChartSettings<ExtendedFiveW>) => {
            onSave(value);
            onClose();
        },
        [onClose, onSave],
    );

    return (
        <Modal
            className={styles.modal}
            bodyClassName={styles.body}
            onClose={onClose}
            header={(
                <h2>
                    Add Chart
                </h2>
            )}
        >
            <SegmentInput
                className={styles.chartTypeInput}
                label="Chart Type"
                options={chartTypeOptions}
                onChange={setChartType}
                value={chartType}
                optionLabelSelector={chartLabelSelector}
                optionKeySelector={chartKeySelector}
            />
            {chartType === 'bar-chart' && (
                <BarChartConfig
                    className={styles.chartConfig}
                    indicatorList={indicatorList}
                    onSave={handleSave}
                />
            )}
            {chartType === 'pie-chart' && (
                <PieChartConfig
                    className={styles.chartConfig}
                    indicatorList={indicatorList}
                    onSave={handleSave}
                />
            )}
            {chartType === 'histogram' && (
                <HistogramConfig
                    className={styles.chartConfig}
                    indicatorList={indicatorList}
                    onSave={handleSave}
                />
            )}
        </Modal>
    );
}

export default ChartModal;
