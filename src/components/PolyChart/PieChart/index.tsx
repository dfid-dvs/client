import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Sector,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { MdPieChart, MdDonutLarge } from 'react-icons/md';
import { AiOutlineEdit, AiOutlineExpandAlt } from 'react-icons/ai';
import { compareNumber, isNotDefined, isDefined, _cs, sum } from '@togglecorp/fujs';
import { IoMdClose, IoMdDownload, IoMdEye, IoMdEyeOff, IoMdSwap } from 'react-icons/io';

import handleChartDownload from '#utils/downloadChart';

import Button from '#components/Button';
import { formatNumber, getPrecision } from '#components/Numeral';
import SegmentInput from '#components/SegmentInput';
import { tableauColors } from '#utils/constants';

import { PieChartSettings } from '#types';
import useBasicToggle from '#hooks/useBasicToggle';

import styles from './styles.css';

const orientations: {
    key: 'pie' | 'donut';
    label: React.ReactNode;
    tooltip: string;
}[] = [
    { key: 'pie', label: <MdPieChart />, tooltip: 'Pie Chart' },
    { key: 'donut', label: <MdDonutLarge />, tooltip: 'Bar Chart' },
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
    if (value.length <= maxLen) {
        return value;
    }
    return `${value.slice(0, maxLen)}…`;
}

interface CustomizedLabel {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    value: number;
}
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = (donut: boolean) => (props: CustomizedLabel) => {
    const {
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        value,
    } = props;
    const factor = donut ? 0.35 : 0.5;
    const radius = innerRadius + (outerRadius - innerRadius) * factor;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <g>
            <text
                x={x}
                y={y}
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fill="#212121"
                fontSize="80%"
            >
                {formatNumeral(value)}
            </text>
        </g>
    );
};

interface PieChartUnitProps<T> {
    settings: PieChartSettings<T>;
    data: T[] | undefined;
    className?: string;
    chartClassName?: string;
    hideActions?: boolean;
    onDelete: (name: string | undefined) => void;
    onExpand: (name: string | undefined) => void;
    expandableIconHidden: boolean;
    onSetEditableChartId?: (name: string | undefined) => void;
}

const chartMargin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
    // payload: unknown;
    percent: number;

    key: string;
    value: number;
}
const createActiveShape = (center: boolean) => (props: ActiveShapeProps) => {
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
                <text
                    x={cx}
                    y={cy}
                    dy={8}
                    textAnchor="middle"
                    fill={fill}
                >
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
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize="0.9em">
                {`${(percent * 100).toFixed(2)}%`}
            </text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontSize="0.8em">
                {formatNumeral(value)}
            </text>
        </g>
    );
};
const ActiveShape = createActiveShape(false);
const CenteredActiveShape = createActiveShape(true);

const renderLegendText = (value: string, entry: any) => {
    const { payload } = entry;
    return (
        <span>
            {value}
            {`(${(payload.percent * 100).toFixed(2)}%)`}
        </span>
    );
};

// eslint-disable-next-line @typescript-eslint/ban-types
export function PieChartUnit<T extends object>(props: PieChartUnitProps<T>) {
    const {
        settings,
        data,
        className,
        onDelete,
        chartClassName,
        hideActions,
        onExpand,
        expandableIconHidden,
        onSetEditableChartId,
    } = props;

    const {
        title,
        keySelector,
        valueSelector,
        id,
    } = settings;

    const newRef = useRef<HTMLDivElement>(null);
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
                .filter(datum => isDefined(datum.value) && datum.value > 0)
                .sort((foo, bar) => compareNumber(
                    foo.value,
                    bar.value,
                    -1,
                ));
            const limit = 8;
            if (mappedData.length <= limit) {
                return mappedData;
            }
            const upper = mappedData.slice(0, limit - 1);
            const lower = mappedData.slice(limit - 1);
            return [...upper, { key: 'Other', value: sum(lower.map(item => item.value)) }];
        },
        [data, valueSelector, keySelector],
    );

    const [allRegionHidden, , , toggleAllRegionHidden] = useBasicToggle();
    const filteredFinalData = useMemo(
        () => {
            if (!allRegionHidden) {
                return finalData;
            }
            return finalData?.filter(
                item => !(item.key === 'All Province' || item.key === 'All District'),
            );
        },
        [allRegionHidden, finalData],
    );

    const hasAllRegion = useMemo(
        () => !!finalData?.find(
            d => d.key === 'All Province' || d.key === 'All District',
        ),
        [finalData],
    );

    const [activeIndex, setActiveIndex] = useState(0);

    const handlePieEnter = (d: unknown, index: number) => {
        setActiveIndex(index);
    };

    const [labelShown, , , toggleLabelShown] = useBasicToggle();

    const handleDownload = useCallback(
        () => {
            handleChartDownload(newRef, title, styles.actions);
        },
        [title],
    );

    const CustomizedLabel = renderCustomizedLabel(type === 'donut');

    return (
        <div
            className={_cs(styles.chartContainer, className)}
            ref={newRef}
        >
            <header className={styles.header}>
                <h3 className={styles.heading}>
                    {title}
                </h3>
                {!hideActions && (
                    <div className={styles.actions}>
                        {!expandableIconHidden && (
                            <Button
                                onClick={handleDownload}
                                name={id}
                                title="Download"
                                transparent
                                variant="icon"
                            >
                                <IoMdDownload className={styles.deleteIcon} />
                            </Button>
                        )}
                        {onSetEditableChartId && (
                            <Button
                                onClick={onSetEditableChartId}
                                name={id}
                                title="Edit chart"
                                transparent
                                variant="icon"
                            >
                                <AiOutlineEdit className={styles.expandIcon} />
                            </Button>
                        )}
                        {!expandableIconHidden && (
                            <Button
                                onClick={onDelete}
                                name={id}
                                title="Delete chart"
                                transparent
                                variant="icon"
                            >
                                <IoMdClose className={styles.deleteIcon} />
                            </Button>
                        )}
                        <Button
                            onClick={toggleLabelShown}
                            name={id}
                            title="View Label"
                            transparent
                            variant="icon"
                        >
                            {labelShown ? (
                                <IoMdEyeOff className={styles.expandIcon} />
                            ) : (
                                <IoMdEye className={styles.expandIcon} />
                            )}
                        </Button>
                        {hasAllRegion && (
                            <Button
                                onClick={toggleAllRegionHidden}
                                name={id}
                                title={allRegionHidden ? 'Show All Data' : 'Hide All Data'}
                                transparent
                                variant="icon"
                            >
                                <IoMdSwap className={styles.expandIcon} />
                            </Button>
                        )}
                        {!expandableIconHidden && (
                            <Button
                                onClick={onExpand}
                                name={id}
                                title="Expand chart"
                                transparent
                                variant="icon"
                            >
                                <AiOutlineExpandAlt className={styles.expandIcon} />
                            </Button>
                        )}
                        <SegmentInput
                            className={styles.segmentInput}
                            options={orientations}
                            optionTitleSelector={item => item.tooltip}
                            optionKeySelector={item => item.key}
                            optionLabelSelector={item => item.label}
                            value={type}
                            onChange={setType}
                        />
                    </div>
                )}
            </header>
            <div className={_cs(styles.responsiveContainer, chartClassName)}>
                {(filteredFinalData?.length || 0) > 0 && (
                    <ResponsiveContainer>
                        <PieChart
                            className={styles.chart}
                            margin={chartMargin}
                        >
                            <Pie
                                data={filteredFinalData}
                                innerRadius={type === 'donut' ? '45%' : undefined}
                                outerRadius="65%"
                                fill="#8884d8"
                                isAnimationActive={false}
                                nameKey="key"
                                dataKey="value"
                                onMouseEnter={handlePieEnter}
                                activeIndex={activeIndex}
                                activeShape={type === 'donut' ? CenteredActiveShape : ActiveShape}
                                labelLine={false}
                                label={labelShown ? <CustomizedLabel /> : false}
                            >
                                {finalData?.map((entry, index) => (
                                    <Cell
                                        key={`cell-${entry.key}`}
                                        fill={tableauColors[index % tableauColors.length]}
                                    />
                                ))}
                            </Pie>
                            <Legend
                                layout="horizontal"
                                align="center"
                                verticalAlign="bottom"
                                formatter={renderLegendText}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
export default PieChartUnit;
