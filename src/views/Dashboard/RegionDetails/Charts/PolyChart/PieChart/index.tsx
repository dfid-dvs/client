import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, TooltipFormatter, Sector } from 'recharts';
import { compareNumber, isNotDefined, isDefined, _cs, sum } from '@togglecorp/fujs';

import { formatNumber, getPrecision } from '#components/Numeral';
import SegmentInput from '#components/SegmentInput';
import { PieChartSettings } from '../../types';

import styles from './styles.css';

const orientations: {
    key: 'pie' | 'donut';
    label: string;
}[] = [
    { key: 'pie', label: 'Pie' },
    { key: 'donut', label: 'Donut' },
];

function formatNumeral(value: number) {
    if (isNotDefined(value)) {
        return '';
    }
    const numberValue = +value;
    const str = formatNumber(numberValue, true, true, getPrecision(numberValue));
    return str;
}

function truncateString(value: string, maxLen = 12) {
    if (value.length < maxLen) {
        return value;
    }
    return `${value.slice(0, maxLen)}…`;
}

const colors = [
    '#4e79a7',
    '#f28e2c',
    '#e15759',
    '#76b7b2',
    '#59a14f',
    '#edc949',
    '#af7aa1',
    '#ff9da7',
    '#9c755f',
    '#bab0ab',
];

interface PieChartUnitProps<T> {
    settings: PieChartSettings<T>;
    data: T[] | undefined;
    className?: string;
}

const chartMargin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
};

interface LabelProps {
    key: string;
    value: number;
    percent: number;
    x: number;
    y: number;
    midAngle: number;
}

const Label = (props: LabelProps) => {
    const { key, percent, x, y, midAngle } = props;
    return (
        <g
            transform={`translate(${x}, ${y})`}
            textAnchor={(midAngle < -90 || midAngle >= 90) ? 'end' : 'start'}
        >
            <text
                x={0}
                y={0}
            >
                {truncateString(key)}
            </text>
            <text
                x={0}
                y={20}
            >
                {`${(percent * 100).toFixed(2)}%`}
            </text>
        </g>
    );
};


interface ActiveShapeProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
    payload: unknown;
    percent: number;

    key: string;
    value: number;
}
const createActiveShape = (center: boolean) => (props: ActiveShapeProps) => {
    const RADIAN = Math.PI / 180;
    const {
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill,
        percent,
        value,
        key,
    } = props;

    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            {!center ? (
                <text x={cx} y={0} dy={8 * 2} textAnchor="middle" fill={fill}>
                    {key}
                </text>
            ) : (
                <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
                    {truncateString(key)}
                </text>
            )}
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
                {`${(percent * 100).toFixed(2)}%`}
            </text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {formatNumeral(value)}
            </text>
        </g>
    );
};
const ActiveShape = createActiveShape(false);
const CenteredActiveShape = createActiveShape(true);

export function PieChartUnit<T extends object>(props: PieChartUnitProps<T>) {
    const {
        settings,
        data,
        className,
    } = props;

    const {
        title,
        keySelector,
        valueSelector,
    } = settings;

    const [type, setType] = useState<'pie' | 'donut'>('donut');

    const finalData = useMemo(
        () => {
            if (!data) {
                return data;
            }
            const mappedData = data
                .map(datum => ({
                    key: keySelector(datum),
                    value: valueSelector(datum),
                }))
                .filter(datum => isDefined(datum.value))
                .sort((foo, bar) => compareNumber(
                    foo.value,
                    bar.value,
                    -1,
                ));
            const limit = 6;
            if (mappedData.length <= limit) {
                return mappedData;
            }
            const upper = mappedData.slice(0, limit - 1);
            const lower = mappedData.slice(limit - 1);
            return [...upper, { key: 'Other', value: sum(lower.map(item => item.value)) }];
        },
        [data, valueSelector, keySelector],
    );


    const [activeIndex, setActiveIndex] = useState(0);

    const handlePieEnter = (d: unknown, index: number) => {
        setActiveIndex(index);
    };

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
                        value={type}
                        onChange={setType}
                    />
                </div>
            </header>
            <PieChart
                className={styles.chart}
                width={400}
                height={300}
                // data={data}
                margin={chartMargin}
            >
                <Pie
                    data={finalData}
                    innerRadius={type === 'donut' ? '40%' : undefined}
                    outerRadius="60%"
                    fill="#8884d8"
                    isAnimationActive={false}
                    nameKey="key"
                    dataKey="value"
                    onMouseEnter={handlePieEnter}
                    activeIndex={activeIndex}
                    activeShape={type === 'donut' ? CenteredActiveShape : ActiveShape}
                    // cx={200}
                    // cy={200}
                    // label={renderCustomizedLabel}
                    // label={Label}
                >
                    {finalData?.map((entry, index) => (
                        <Cell
                            key={`cell-${entry.key}`}
                            fill={colors[index % colors.length]}
                        />
                    ))}
                </Pie>
            </PieChart>
        </div>
    );
}
export default PieChartUnit;
