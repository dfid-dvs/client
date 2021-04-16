import React, { useState, useCallback, useContext } from 'react';
import { GiHistogram } from 'react-icons/gi';
import { FcBarChart, FcPieChart, FcComboChart, FcScatterPlot } from 'react-icons/fc';

import Modal from '#components/Modal';
import SegmentInput from '#components/SegmentInput';
import ScatterChartConfig from './ScatterChartConfig';

import { ChartSettings, NumericOption } from '#types';

import BarChartConfig from './BarChartConfig';
import PieChartConfig from './PieChartConfig';
import HistogramConfig from './HistogramConfig';
import BiAxialChartConfig from './BiAxialChartConfig';

import styles from './styles.css';

type ChartType = 'bar-chart' | 'pie-chart' | 'histogram' | 'bi-axial-chart' | 'scatter-chart';

interface ChartTypeOption {
    type: ChartType;
    name: React.ReactNode;
}

const chartTypeOptions: ChartTypeOption[] = [
    {
        type: 'bar-chart',
        name: (
            <>
                <FcBarChart />
                &nbsp;
                Bar Chart
            </>
        ),
    },
    {
        type: 'bi-axial-chart',
        name: (
            <>
                <FcComboChart />
                &nbsp;
                Bi-Axial Chart
            </>
        ),
    },
    {
        type: 'pie-chart',
        name: (
            <>
                <FcPieChart />
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
    {
        type: 'scatter-chart',
        name: (
            <>
                <FcScatterPlot />
                &nbsp;
                Scattter Chart
            </>
        ),
    },
];

const chartLabelSelector = (item: ChartTypeOption) => item.name;
const chartKeySelector = (item: ChartTypeOption) => item.type;

interface Props<T> {
    onSave: (settings: ChartSettings<T>) => void;
    onClose: () => void;
    options: NumericOption<T>[];
    keySelector: (item: T) => string;
    editableChartSettings?: ChartSettings<T> | undefined;
}

function ChartModal<T>(props: Props<T>) {
    const {
        onClose,
        onSave,
        options,
        keySelector,
        editableChartSettings,
    } = props;

    const [chartType, setChartType] = useState<ChartType>(editableChartSettings ? editableChartSettings.type : 'bar-chart');

    const handleSave = useCallback(
        (value: ChartSettings<T>) => {
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
            headerClassName={styles.header}
        >
            <SegmentInput
                className={styles.chartTypeInput}
                label="Chart Type"
                options={chartTypeOptions}
                onChange={setChartType}
                value={chartType}
                optionLabelSelector={chartLabelSelector}
                optionKeySelector={chartKeySelector}
                labelClassName={styles.label}
            />
            {chartType === 'bar-chart' && (
                <BarChartConfig
                    className={styles.chartConfig}
                    onSave={handleSave}
                    keySelector={keySelector}
                    options={options}
                    editableChartData={editableChartSettings}
                />
            )}
            {chartType === 'pie-chart' && (
                <PieChartConfig
                    className={styles.chartConfig}
                    onSave={handleSave}
                    keySelector={keySelector}
                    options={options}
                    editableChartData={editableChartSettings}
                />
            )}
            {chartType === 'histogram' && (
                <HistogramConfig
                    className={styles.chartConfig}
                    onSave={handleSave}
                    options={options}
                    editableChartData={editableChartSettings}
                />
            )}
            {chartType === 'bi-axial-chart' && (
                <BiAxialChartConfig
                    className={styles.chartConfig}
                    onSave={handleSave}
                    keySelector={keySelector}
                    options={options}
                    editableChartData={editableChartSettings}
                />
            )}
            {chartType === 'scatter-chart' && (
                <ScatterChartConfig
                    className={styles.chartConfig}
                    onSave={handleSave}
                    keySelector={keySelector}
                    options={options}
                    editableChartData={editableChartSettings}
                />
            )}
        </Modal>
    );
}

export default ChartModal;
