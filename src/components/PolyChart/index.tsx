import React, { useMemo } from 'react';

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
    onExpand: (name: string | undefined) => void;
    chartExpanded: string | undefined;
}

function PolyChart<T extends object>(props: Props<T>) {
    const {
        settings,
        data,
        className,
        onDelete,
        chartClassName,
        hideActions,
        onExpand,
        chartExpanded,
    } = props;

    const expandableIconHidden = useMemo(
        () => chartExpanded === settings.id,
        [chartExpanded, settings.id],
    );

    if (isBarChart(settings)) {
        return (
            <BarChart
                onDelete={onDelete}
                data={data}
                hideActions={hideActions}
                settings={settings}
                className={className}
                chartClassName={chartClassName}
                onExpand={onExpand}
                expandableIconHidden={expandableIconHidden}
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
                onExpand={onExpand}
                expandableIconHidden={expandableIconHidden}
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
                onExpand={onExpand}
                expandableIconHidden={expandableIconHidden}
            />
        );
    }
    return null;
}
export default PolyChart;
