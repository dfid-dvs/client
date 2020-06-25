import React from 'react';

import { ChartSettings, isBarChart, isPieChart, isHistogram } from '../types';

import BarChart from './BarChart';
import PieChart from './PieChart';
import Histogram from './Histogram';

interface Props<T> {
    settings: ChartSettings<T>;
    data: T[] | undefined;
    className?: string;
}

function PolyChart<T extends object>(props: Props<T>) {
    const { settings, data, className } = props;
    if (isBarChart(settings)) {
        return (
            <BarChart
                data={data}
                settings={settings}
                className={className}
            />
        );
    }
    if (isPieChart(settings)) {
        return (
            <PieChart
                data={data}
                settings={settings}
                className={className}
            />
        );
    }
    if (isHistogram(settings)) {
        return (
            <Histogram
                data={data}
                settings={settings}
                className={className}
            />
        );
    }
    return null;
}
export default PolyChart;
