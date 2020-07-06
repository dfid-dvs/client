import React, { useMemo, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    TooltipFormatter,
    ResponsiveContainer,
} from 'recharts';
import { IoMdTrash } from 'react-icons/io';
import { compareNumber, isNotDefined, isDefined, _cs } from '@togglecorp/fujs';

import { formatNumber, getPrecision } from '#components/Numeral';
import Button from '#components/Button';
import SegmentInput from '#components/SegmentInput';
import { BarChartSettings } from '#types';

import styles from './styles.css';

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
    chartClassName?: string;
    hideActions?: boolean;
    onDelete: (name: string | undefined) => void;
}

const chartMargin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
};

export function BarChartUnit<T extends object>(props: BarChartUnitProps<T>) {
    const {
        className,
        chartClassName,
        settings,
        data,
        onDelete,
        hideActions,
    } = props;

    const {
        title,
        keySelector,
        bars,
        // layout,
        limit,
        id,
        orientation,
    } = settings;

    const [layout, setLayout] = useState<'horizontal' | 'vertical'>(orientation || 'horizontal');

    const Xcomp = layout === 'vertical' ? YAxis : XAxis;
    const Ycomp = layout === 'vertical' ? XAxis : YAxis;

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
                {!hideActions && (
                    <div className={styles.actions}>
                        <Button
                            onClick={onDelete}
                            name={id}
                            title="Delete chart"
                            transparent
                            variant="danger"
                        >
                            <IoMdTrash />
                        </Button>
                        <SegmentInput
                            options={orientations}
                            optionKeySelector={item => item.key}
                            optionLabelSelector={item => item.label}
                            value={layout}
                            onChange={setLayout}
                        />
                    </div>
                )}
            </header>
            <div className={_cs(styles.responsiveContainer, chartClassName)}>
                <ResponsiveContainer>
                    <BarChart
                        className={styles.chart}
                        data={finalData}
                        layout={layout}
                        margin={chartMargin}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <Xcomp
                            dataKey={keySelector}
                            type="category"
                            interval={layout === 'vertical' ? 0 : undefined}
                            width={layout === 'vertical' ? 86 : undefined}
                        />
                        <Ycomp
                            type="number"
                            tickFormatter={valueTickFormatter}
                            interval={layout === 'vertical' ? 0 : undefined}
                            width={layout === 'horizontal' ? 36 : undefined}
                        />
                        <Tooltip
                            allowEscapeViewBox={{ x: false, y: true }}
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
                </ResponsiveContainer>
            </div>
        </div>
    );
}
export default BarChartUnit;
