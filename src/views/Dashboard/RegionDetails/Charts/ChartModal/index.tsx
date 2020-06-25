import React, { useState, useCallback } from 'react';

import Modal from '#components/Modal';
import SelectInput from '#components/SelectInput';
import {
    Indicator,
} from '#types';


import { ChartSettings } from '../types';
import { ExtendedFiveW } from '../../../useExtendedFiveW';

import BarChartConfig from './BarChartConfig';
import PieChartConfig from './PieChartConfig';
import styles from './styles.css';

type ChartType = 'bar-chart' | 'pie-chart';

interface ChartTypeOption {
    type: ChartType;
    name: string;
}

const chartTypeOptions: ChartTypeOption[] = [
    {
        type: 'bar-chart',
        name: 'Bar Chart',
    },
    {
        type: 'pie-chart',
        name: 'Pie Chart',
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

    const [chartType, setChartType] = useState<ChartType | undefined>();
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
            <SelectInput
                className={styles.chartTypeInput}
                label="Chart Type"
                options={chartTypeOptions}
                onChange={setChartType}
                value={chartType}
                optionLabelSelector={chartLabelSelector}
                optionKeySelector={chartKeySelector}
                nonClearable
                autoFocus
            />
            {chartType === 'bar-chart' && (
                <BarChartConfig
                    indicatorList={indicatorList}
                    onSave={handleSave}
                />
            )}
            {chartType === 'pie-chart' && (
                <PieChartConfig
                    indicatorList={indicatorList}
                    onSave={handleSave}
                />
            )}
        </Modal>
    );
}

export default ChartModal;
