import React, { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    TooltipFormatter,
} from 'recharts';
import { compareNumber, isNotDefined, isDefined, _cs } from '@togglecorp/fujs';

import { formatNumber, getPrecision } from '#components/Numeral';
import SegmentInput from '#components/SegmentInput';

import styles from './styles.css';

export interface BarChartSettings<T> {
    id: string;
    type: 'bar-chart';
    title: string;

    // layout: 'vertical' | 'horizontal';
    keySelector: (value: T) => string;
    bars: {
        title: string;
        valueSelector: (value: T) => number | null;
        color: string;
        stackId?: string;
    }[];

    limit?: {
        count: number;
        method: 'min' | 'max';
        valueSelector: (value: T) => number | null;
    };

    dependencies?: number[];
}
export interface PieChartSettings<T> {
    id: string;
    type: 'pie-chart';
    title: string;

    keySelector: (value: T) => string;
    valueSelector: (value: T) => string;

    colorPalette?: string[];

    dependencies?: [];
}

export type ChartSettings<T> = BarChartSettings<T> | PieChartSettings<T>;

function isBarChart<T>(settings: ChartSettings<T>): settings is BarChartSettings<T> {
    return settings.type === 'bar-chart';
}

const orientations: {
    key: 'horizontal' | 'vertical';
    label: string;
}[] = [
    { key: 'horizontal', label: 'H' },
    { key: 'vertical', label: 'V' },
];

const valueTickFormatter: TooltipFormatter = (value) => {
    if (isNotDefined(value)) {
        return '';
    }
    const numberValue = +value;
    const str = formatNumber(numberValue, true, true, getPrecision(numberValue));
    return str;
};

interface BarChartUnitProps<T> {
    settings: BarChartSettings<T>;
    data: T[] | undefined;
    className?: string;
}

const chartMargin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
};

function BarChartUnit<T extends object>(props: BarChartUnitProps<T>) {
    const {
        settings,
        data,
        className,
    } = props;

    const {
        title,
        keySelector,
        bars,
        // layout,
        limit,
    } = settings;

    const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');

    const Xcomp = layout === 'vertical' ? YAxis : XAxis;
    const Ycomp = layout === 'vertical' ? XAxis : YAxis;

    // FIXME: memoize this
    const finalData = useMemo(
        () => {
            if (!limit || !data) {
                return data;
            }
            return data
                .filter(datum => isDefined(limit.valueSelector(datum)))
                .sort((foo, bar) => compareNumber(
                    limit.valueSelector(foo),
                    limit.valueSelector(bar),
                    limit.method === 'max' ? -1 : 1,
                ))
                .slice(0, limit.count);
        },
        [data, limit],
    );

    return (
        <div className={_cs(styles.chartContainer, className)}>
            <header className={styles.header}>
                <h3 className={styles.heading}>
                    {title}
                </h3>
                <div className={styles.actions}>
                    <SegmentInput
                        options={orientations}
                        optionKeySelector={item => item.key}
                        optionLabelSelector={item => item.label}
                        value={layout}
                        onChange={setLayout}
                    />
                </div>
            </header>
            <BarChart
                className={styles.chart}
                width={400}
                height={300}
                data={finalData}
                layout={layout}
                margin={chartMargin}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <Xcomp
                    dataKey={keySelector}
                    type="category"
                    width={layout === 'vertical' ? 86 : undefined}
                />
                <Ycomp
                    type="number"
                    tickFormatter={valueTickFormatter}
                    width={layout === 'horizontal' ? 36 : undefined}
                />
                <Tooltip
                    offset={20}
                    formatter={valueTickFormatter}
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

interface Props<T> {
    settings: ChartSettings<T>;
    data: T[] | undefined;
    className?: string;
}

function PolyChart<T extends object>(props: Props<T>) {
    const { settings, data, className } = props;
    if (isBarChart(settings)) {
        return (
            <BarChartUnit
                data={data}
                settings={settings}
                className={className}
            />
        );
    }
    return null;
}
export default PolyChart;
