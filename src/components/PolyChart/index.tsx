import React, { useMemo } from 'react';

import {
    ChartSettings,
    isBarChart,
    isPieChart,
    isHistogram,
    isBiAxialChart,
    isScatterChart,
} from '#types';

import BarChart from './BarChart';
import PieChart from './PieChart';
import Histogram from './Histogram';
import BiAxialChart from './BiAxialChart';
import ScatterChart from './ScatterChart';

interface Props<T> {
    settings: ChartSettings<T>;
    data: T[] | undefined;
    className?: string;
    onDelete: (name: string | undefined) => void;
    chartClassName?: string;
    hideActions?: boolean;
    onExpand: (name: string | undefined) => void;
    chartExpanded: string | undefined;
    onSetEditableChartId?: (name: string | undefined) => void;
}

// eslint-disable-next-line @typescript-eslint/ban-types
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
        onSetEditableChartId,
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
                onSetEditableChartId={onSetEditableChartId}
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
                onSetEditableChartId={onSetEditableChartId}
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
                onSetEditableChartId={onSetEditableChartId}
            />
        );
    }

    if (isBiAxialChart(settings)) {
        return (
            <BiAxialChart
                onDelete={onDelete}
                data={data}
                settings={settings}
                hideActions={hideActions}
                className={className}
                chartClassName={chartClassName}
                onExpand={onExpand}
                expandableIconHidden={expandableIconHidden}
                onSetEditableChartId={onSetEditableChartId}
            />
        );
    }

    if (isScatterChart(settings)) {
        return (
            <ScatterChart
                onDelete={onDelete}
                data={data}
                settings={settings}
                hideActions={hideActions}
                className={className}
                chartClassName={chartClassName}
                onExpand={onExpand}
                expandableIconHidden={expandableIconHidden}
                onSetEditableChartId={onSetEditableChartId}
            />
        );
    }
    return null;
}
export default PolyChart;
