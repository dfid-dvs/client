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
    TooltipProps,
} from 'recharts';
import { IoIosSwap, IoMdClose, IoMdDownload } from 'react-icons/io';
import { AiOutlineEdit, AiOutlineExpandAlt } from 'react-icons/ai';
import { compareNumber, isNotDefined, isDefined, _cs, caseInsensitiveSubmatch } from '@togglecorp/fujs';

import { formatNumber, getPrecision } from '#components/Numeral';
import Button from '#components/Button';
import { BiAxialChartSettings, BiAxialData } from '#types';
import useBasicToggle from '#hooks/useBasicToggle';
import handleChartDownload from '#utils/downloadChart';

import styles from './styles.css';

const categoryTickFormatter = (value: string) => {
    const words = value.trim().split(/\s+/);
    // NOTE: words "Province", "District", "Municipality" removed from tickformatter for better UI
    const administrationIndex = words.findIndex(
        i => caseInsensitiveSubmatch(i, 'Province') || caseInsensitiveSubmatch(i, 'District') || caseInsensitiveSubmatch(i, 'Municipality'),
    );
    if (administrationIndex <= 0) return words.join(' ');
    return words.slice(0, administrationIndex).join(' ');
};

const valueTickFormatter: TickFormatterFunction = (value) => {
    if (isNotDefined(value)) {
        return '';
    }
    const numberValue = +value;
    const str = formatNumber(numberValue, true, true, getPrecision(numberValue));
    return str;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (!payload || payload.length <= 0) { return null; }
    const {
        name: firstName,
        value: firstValue,
        color: firstColor,
    } = payload[0];
    const {
        name: secondName,
        value: secondValue,
        color: secondColor,
    } = payload[1];
    if (active) {
        return (
            <div className={styles.customTooltip}>
                <div className={styles.label}>{label}</div>
                <div
                    className={styles.label}
                    style={{ color: firstColor }}
                >
                    {`${firstName} : ${valueTickFormatter(firstValue)}`}
                </div>
                <div style={{ color: secondColor }}>
                    {`${secondName} : ${valueTickFormatter(secondValue)}`}
                </div>
            </div>
        );
    }
    return null;
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

// eslint-disable-next-line @typescript-eslint/ban-types
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
        acronymSelector,
        chartData,
        limit,
        id,
    } = settings;

    const [firstData, secondData]: (BiAxialData<T> | undefined)[] = useMemo(() => {
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
                                dataKey={acronymSelector ?? keySelector}
                                type="category"
                                interval={0}
                                // textAnchor="end"
                                tickFormatter={categoryTickFormatter}
                                angle={-15}
                            />
                            <YAxis
                                type="number"
                                width={36}
                                tickFormatter={valueTickFormatter}
                                label={{
                                    value: firstData?.title,
                                    angle: -90,
                                    position: 'insideLeft',
                                }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tickFormatter={valueTickFormatter}
                                label={{
                                    value: secondData?.title,
                                    angle: 90,
                                    position: 'insideRight',
                                }}
                            />
                            <Tooltip
                                allowEscapeViewBox={{ x: false, y: false }}
                                offset={20}
                                content={<CustomTooltip />}
                            />
                            <Legend />
                            {[firstData, secondData].map(item => (
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
