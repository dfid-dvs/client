import React from 'react';

import { ChartSettings, isBarChart } from '../types';

import BarChart from './BarChart';

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
    return null;
}
export default PolyChart;
