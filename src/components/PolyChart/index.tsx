import React from 'react';

import { ChartSettings, isBarChart, isPieChart, isHistogram } from '#types';

import BarChart from './BarChart';
import PieChart from './PieChart';
import Histogram from './Histogram';

interface Props<T> {
    settings: ChartSettings<T>;
    data: T[] | undefined;
    className?: string;
    onDelete: (name: string | undefined) => void;
    chartClassName?: string;
    hideActions?: boolean;
}

function PolyChart<T extends object>(props: Props<T>) {
    const {
        settings,
        data,
        className,
        onDelete,
        chartClassName,
        hideActions,
    } = props;

    if (isBarChart(settings)) {
        return (
            <BarChart
                onDelete={onDelete}
                data={data}
                hideActions={hideActions}
                settings={settings}
                className={className}
                chartClassName={chartClassName}
            />
        );
    }
    if (isPieChart(settings)) {
        return (
            <PieChart
                onDelete={onDelete}
                data={data}
                settings={settings}
                hideActions={hideActions}
                className={className}
                chartClassName={chartClassName}
            />
        );
    }
    if (isHistogram(settings)) {
        return (
            <Histogram
                onDelete={onDelete}
                data={data}
                settings={settings}
                hideActions={hideActions}
                className={className}
                chartClassName={chartClassName}
            />
        );
    }
    return null;
}
export default PolyChart;
