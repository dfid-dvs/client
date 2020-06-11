import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

export interface BarChartSettings<T> {
    id: string;
    type: 'bar-chart';
    title: string;

    layout: 'vertical' | 'horizontal';
    keySelector: (value: T) => string;
    bars: {
        title: string;
        valueSelector: (value: T) => number | null;
        color: string;
        stackId?: string;
    }[];
}
export interface PieChartSettings<T> {
    id: string;
    type: 'pie-chart';
    title: string;

    keySelector: (value: T) => string;
    valueSelector: (value: T) => string;

    colorPalette?: string[];
}

export type ChartSettings<T> = BarChartSettings<T> | PieChartSettings<T>;

function isBarChart<T>(settings: ChartSettings<T>): settings is BarChartSettings<T> {
    return settings.type === 'bar-chart';
}

interface Props<T> {
    settings: ChartSettings<T>;
    data: T[] | undefined;
}

function Chart<T extends object>(props: Props<T>) {
    const { settings, data } = props;
    if (!data || data.length <= 0) {
        return null;
    }
    if (isBarChart(settings)) {
        const {
            title,
            keySelector,
            bars,
            layout,
        } = settings;

        const Xcomp = layout === 'vertical' ? YAxis : XAxis;
        const Ycomp = layout === 'vertical' ? XAxis : YAxis;

        return (
            <div>
                <h3>{title}</h3>
                <BarChart
                    width={300}
                    height={200}
                    data={data}
                    margin={{
                        top: 5, right: 30, left: 50, bottom: 5,
                    }}
                    layout={layout}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <Xcomp dataKey={keySelector} type="category" />
                    <Ycomp type="number" />
                    <Tooltip
                        allowEscapeViewBox={{ x: true, y: true }}
                        offset={20}
                    />
                    <Legend />
                    {bars.map(bar => (
                        <Bar
                            key={bar.title}
                            name={bar.title}
                            dataKey={bar.valueSelector}
                            fill={bar.color}
                            stackId={bar.stackId}
                        />
                    ))}
                </BarChart>
            </div>
        );
    }
    return null;
}
export default Chart;
