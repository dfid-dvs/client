import React, { useCallback, useMemo } from 'react';
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line,
    ComposedChart,
    TickFormatterFunction,
} from 'recharts';
import { IoIosSwap, IoMdClose, IoMdDownload } from 'react-icons/io';
import { AiOutlineEdit, AiOutlineExpandAlt } from 'react-icons/ai';
import { compareNumber, isNotDefined, isDefined, _cs, sum } from '@togglecorp/fujs';

import { formatNumber, getPrecision } from '#components/Numeral';
import Button from '#components/Button';
import { BiAxialChartSettings, BiAxialData } from '#types';
import useBasicToggle from '#hooks/useBasicToggle';
import handleChartDownload from '#utils/downloadChart';

import styles from './styles.css';

const categoryTickFormatter = (value: string) => {
    const words = value.trim().split(/\s+/);
    if (words.length <= 1) {
        return value.slice(0, 3).toUpperCase();
    }
    return words.map(item => item[0]).join('').toUpperCase();
};

const valueTickFormatter: TickFormatterFunction = (value) => {
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
    onSetEditableChartId?: (name: string | undefined) => void;
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
        onSetEditableChartId,
    } = props;

    const newRef = React.useRef<HTMLDivElement>(null);

    const [chartTypeToggled, , , onToggleChartType] = useBasicToggle();

    const {
        title,
        keySelector,
        chartData,
        limit,
        id,
    } = settings;

    const formattedChartData: (BiAxialData<T> | undefined)[] = useMemo(() => {
        const tmpChart: BiAxialData<T>[] = chartTypeToggled ? chartData.map(item => ({
            ...item,
            type: item.type === 'bar' ? 'line' : 'bar',
        })) : chartData;
        const barChartData = tmpChart.find(t => t.type === 'bar');
        const lineChartData = tmpChart.find(t => t.type === 'line');
        return [barChartData, lineChartData];
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

    const averageLength: number = useMemo(() => {
        if (finalData) {
            return sum(finalData.map(item => keySelector(item).length)) / finalData.length;
        }
        return 0;
    }, [finalData, keySelector]);

    const hasLongTitles = averageLength > 5;

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
            <header className={_cs(styles.header, headerClassName)}>
                <h3 className={styles.heading}>
                    {title}
                </h3>
                {!hideActions && (
                    <div className={styles.actions}>
                        <Button
                            onClick={handleDownload}
                            name={id}
                            title="Download"
                            transparent
                            variant="icon"
                        >
                            <IoMdDownload className={styles.deleteIcon} />
                        </Button>
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
                        <Button
                            onClick={onDelete}
                            name={id}
                            title="Delete"
                            transparent
                            variant="icon"
                        >
                            <IoMdClose className={styles.deleteIcon} />
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
                        <Button
                            onClick={onToggleChartType}
                            name={id}
                            title="Toggle chart type"
                            transparent
                            variant="icon"
                        >
                            <IoIosSwap className={styles.toggleIcon} />
                        </Button>
                    </div>
                )}
            </header>
            <div className={_cs(styles.responsiveContainer, chartClassName)}>
                {(finalData?.length || 0) > 0 && (
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
                                allowEscapeViewBox={{ x: false, y: false }}
                                offset={20}
                                formatter={valueTickFormatter}
                            />
                            <Legend />
                            {formattedChartData.map(item => (
                                item?.type === 'bar'
                                    ? item && (
                                        <Bar
                                            key={item.title}
                                            name={item.title}
                                            dataKey={item.valueSelector}
                                            fill={item.color}
                                            stackId={item.stackId}
                                            barSize={22}
                                        />
                                    ) : item && (
                                        <Line
                                            key={item.title}
                                            name={item.title}
                                            dataKey={item.valueSelector}
                                            fill={item.color}
                                            yAxisId="right"
                                            stroke={item.color}
                                            activeDot={{ r: 8 }}
                                        />
                                    )
                            ))}
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
export default BiAxialChartUnit;
