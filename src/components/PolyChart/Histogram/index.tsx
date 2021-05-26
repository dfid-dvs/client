import React, { useCallback, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from 'recharts';
import { isNotDefined, isDefined, _cs, listToGroupList } from '@togglecorp/fujs';
import { IoMdClose, IoMdDownload, IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { AiOutlineEdit, AiOutlineExpandAlt } from 'react-icons/ai';

import Button from '#components/Button';
import { formatNumber, getPrecision } from '#components/Numeral';
import { HistogramSettings } from '#types';
import handleChartDownload from '#utils/downloadChart';
import useBasicToggle from '#hooks/useBasicToggle';

import styles from './styles.css';

const valueTickFormatter = (value: number | string | undefined) => {
    if (isNotDefined(value)) {
        return '';
    }
    const numberValue = +value;
    const str = formatNumber(numberValue, true, true, getPrecision(numberValue));
    return str;
};

interface CustomizedLabel {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    value?: number | string;
}

const renderCustomizedLabel = (props: CustomizedLabel) => {
    const { x = 0, y = 0, width = 0, value = 0 } = props;
    const fontSize = width / 4;
    const xValue = x + width / 2 + 1;
    const yValue = y - width / 4 + 6;

    return (
        <g>
            <text
                x={xValue}
                y={yValue}
                fill="#212121"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize={fontSize}
            >
                {valueTickFormatter(value)}
            </text>
        </g>
    );
};

interface HistogramUnitProps<T> {
    settings: HistogramSettings<T>;
    data: T[] | undefined;
    className?: string;
    onDelete: (name: string | undefined) => void;
    chartClassName?: string;
    hideActions?: boolean;
    onExpand: (name: string | undefined) => void;
    expandableIconHidden: boolean;
    onSetEditableChartId?: (name: string | undefined) => void;
}

const chartMargin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
};

// eslint-disable-next-line @typescript-eslint/ban-types
export function HistogramUnit<T extends object>(props: HistogramUnitProps<T>) {
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
    const newRef = React.useRef<HTMLDivElement>(null);

    const {
        title,
        valueSelector,
        color,
        binCount,
        id,
    } = settings;

    const finalData = useMemo(
        () => {
            if (!data) {
                return undefined;
            }
            const values = data.map(datum => valueSelector(datum)).filter(isDefined);
            const min = Math.min(...values);
            const max = Math.max(...values);
            if (values.length <= 1 || min === max) {
                return undefined;
            }
            const gap = (max - min) / (binCount - 1);

            const valuesWithBin = values.map(item => ({
                bin: Math.round((item - min) / gap),
                value: item,
            }));

            const binnedValues = listToGroupList(
                valuesWithBin,
                item => item.bin,
                item => item.value,
            );

            const finalValues = (Array.from({ length: binCount })).map((_, index) => ({
                key: `${valueTickFormatter(min + (gap * index))} - ${valueTickFormatter(min + (gap * (index + 1)))}`,
                value: binnedValues[index] ? binnedValues[index].length : 0,
            }));

            return finalValues;
        },
        [data, valueSelector, binCount],
    );

    const [labelShown, , , toggleLabelShown] = useBasicToggle();

    const handleDownload = useCallback(
        () => {
            handleChartDownload(newRef, title, styles.actions);
        },
        [title],
    );

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
                                title="Edit"
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
                                title="Delete"
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
                        {!expandableIconHidden && (
                            <Button
                                onClick={onExpand}
                                name={id}
                                title="Expand"
                                transparent
                                variant="icon"
                            >
                                <AiOutlineExpandAlt className={styles.expandIcon} />
                            </Button>
                        )}
                    </div>
                )}
            </header>
            <div className={_cs(styles.responsiveContainer, chartClassName)}>
                {(finalData?.length || 0) > 0 && (
                    <ResponsiveContainer>
                        <BarChart
                            className={styles.chart}
                            data={finalData}
                            margin={chartMargin}
                            barCategoryGap={0}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="key"
                                type="category"
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                type="number"
                                label={{
                                    value: 'Frequency',
                                    angle: -90,
                                    position: 'insideLeft',
                                }}
                            />
                            <Tooltip
                                allowEscapeViewBox={{ x: false, y: false }}
                                offset={20}
                            />
                            <Bar
                                name="Frequency"
                                dataKey="value"
                                fill={color}
                            >
                                {labelShown && (
                                    <LabelList
                                        dataKey="value"
                                        formatter={valueTickFormatter}
                                        content={renderCustomizedLabel}
                                    />
                                )}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
export default HistogramUnit;
