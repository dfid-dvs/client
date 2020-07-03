import React from 'react';

import { ChartSettings, isBarChart, isPieChart, isHistogram } from '../types';

import BarChart from './BarChart';
import PieChart from './PieChart';
import Histogram from './Histogram';

interface Props<T> {
    settings: ChartSettings<T>;
    data: T[] | undefined;
    className?: string;
    onDelete: (name: string | undefined) => void;
}

function PolyChart<T extends object>(props: Props<T>) {
    const { settings, data, className, onDelete } = props;
    if (isBarChart(settings)) {
        return (
            <BarChart
                onDelete={onDelete}
                data={data}
                settings={settings}
                className={className}
            />
        );
    }
    if (isPieChart(settings)) {
        return (
            <PieChart
                onDelete={onDelete}
                data={data}
                settings={settings}
                className={className}
            />
        );
    }
    if (isHistogram(settings)) {
        return (
            <Histogram
                onDelete={onDelete}
                data={data}
                settings={settings}
                className={className}
            />
        );
    }
    return null;
}
export default PolyChart;
