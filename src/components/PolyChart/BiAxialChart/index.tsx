import React, { useMemo } from 'react';
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    TooltipFormatter,
    ResponsiveContainer,
    Line,
    ComposedChart,
} from 'recharts';
import { IoIosSwap, IoMdClose } from 'react-icons/io';
import { AiOutlineExpandAlt } from 'react-icons/ai';
import { compareNumber, isNotDefined, isDefined, _cs, sum } from '@togglecorp/fujs';

import { formatNumber, getPrecision } from '#components/Numeral';
import Button from '#components/Button';
import { BiAxialChartSettings, BiAxialData } from '#types';
import useBasicToggle from '#hooks/useBasicToggle';

import styles from './styles.css';

const categoryTickFormatter = (value: string) => {
    const words = value.trim().split(/\s+/);
    if (words.length <= 1) {
        return value.slice(0, 3).toUpperCase();
    }
    return words.map(item => item[0]).join('').toUpperCase();
};

const valueTickFormatter: TooltipFormatter = (value) => {
    if (isNotDefined(value)) {
        return '';
    }
    const numberValue = +value;
    const str = formatNumber(numberValue, true, true, getPrecision(numberValue));
    return str;
};

interface BiAxialChartUnitProps<T> {
    settings: BiAxialChartSettings<T>;
    data: T[] | undefined;
    className?: string;
    chartClassName?: string;
    headerClassName?: string;
    hideActions?: boolean;
    onDelete: (name: string | undefined) => void;
    onExpand: (name: string | undefined) => void;
    expandableIconHidden: boolean;
}

const chartMargin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
};

export function BiAxialChartUnit<T extends object>(props: BiAxialChartUnitProps<T>) {
    const {
        className,
        chartClassName,
        headerClassName,
        settings,
        data,
        onDelete,
        hideActions,
        onExpand,
        expandableIconHidden,
    } = props;

    const [chartTypeToggled, , , onToggleChartType] = useBasicToggle();

    const {
        title,
        keySelector,
        chartData,
        limit,
        id,
    } = settings;

    const formattedChartData: BiAxialData<T>[] = useMemo(() => {
        if (chartTypeToggled) {
            const [firstData, secondData] = chartData;
            const tmpFirstDataType = firstData.type === 'bar' ? 'line' : 'bar';
            const tmpSecondDataType = secondData.type === 'line' ? 'bar' : 'line';
            return [
                { ...firstData, type: tmpFirstDataType },
                { ...secondData, type: tmpSecondDataType },
            ];
        }
        return chartData;
    }, [chartTypeToggled, chartData]);

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

    const averageLength: number = finalData
        ? sum(finalData.map(item => keySelector(item).length)) / finalData.length
        : 0;

    const hasLongTitles = averageLength > 5;

    return (
        <div className={_cs(styles.chartContainer, className)}>
            <header className={_cs(styles.header, headerClassName)}>
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
                            <IoMdClose className={styles.deleteIcon} />
                        </Button>
                        <Button
                            onClick={onToggleChartType}
                            name={id}
                            title="Toggle chart type"
                            transparent
                        >
                            <IoIosSwap className={styles.deleteIcon} />
                        </Button>
                        {!expandableIconHidden && (
                            <Button
                                onClick={onExpand}
                                name={id}
                                title="Expand chart"
                                transparent
                                variant="danger"
                            >
                                <AiOutlineExpandAlt className={styles.expandIcon} />
                            </Button>
                        )}
                    </div>
                )}
            </header>
            <div className={_cs(styles.responsiveContainer, chartClassName)}>
                <ResponsiveContainer>
                    <ComposedChart
                        className={styles.chart}
                        data={finalData}
                        layout="horizontal"
                        margin={chartMargin}
                        barGap={0}
                    >
                        <CartesianGrid
                            strokeDasharray="0"
                            vertical={false}
                        />
                        <XAxis
                            dataKey={keySelector}
                            type="category"
                            interval={0}
                            textAnchor="end"
                            tickFormatter={hasLongTitles ? categoryTickFormatter : undefined}
                        />
                        <YAxis
                            type="number"
                            width={36}
                            tickFormatter={valueTickFormatter}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={valueTickFormatter}
                        />
                        <Tooltip
                            allowEscapeViewBox={{ x: false, y: true }}
                            offset={20}
                            formatter={valueTickFormatter}
                        />
                        <Legend />
                        {formattedChartData.map(item => (
                            item?.type === 'bar' ?
                                item && ( <Bar
                                    key={item.title}
                                    name={item.title}
                                    dataKey={item.valueSelector}
                                    fill={item.color}
                                    stackId={item.stackId}
                                    barSize={22}
                                />)
                            : item && (
                                <Line
                                    key={item.title}
                                    name={item.title}
                                    dataKey={item.valueSelector}
                                    fill={item.color}
                                    yAxisId="right"
                                />
                            )
                        ))}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
export default BiAxialChartUnit;
