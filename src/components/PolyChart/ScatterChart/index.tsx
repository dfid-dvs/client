import React, { useCallback, useMemo, useRef } from 'react';
import {
    ScatterChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Scatter,
    TickFormatterFunction,
} from 'recharts';
import { isNotDefined, _cs, sum, isDefined } from '@togglecorp/fujs';
import { IoMdClose, IoMdDownload } from 'react-icons/io';
import { AiOutlineEdit, AiOutlineExpandAlt } from 'react-icons/ai';

import handleChartDownload from '#utils/downloadChart';

import Button from '#components/Button';
import { formatNumber, getPrecision } from '#components/Numeral';
import { ScatterChartSettings } from '#types';

import styles from './styles.css';

interface ScatterChartUnitProps<T> {
    settings: ScatterChartSettings<T>;
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

const valueTickFormatter: TickFormatterFunction = (value) => {
    if (isNotDefined(value)) {
        return '';
    }
    const numberValue = +value;
    const str = formatNumber(numberValue, true, true, getPrecision(numberValue));
    return str;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export function ScatterChartUnit<T extends object>(props: ScatterChartUnitProps<T>) {
    const {
        settings,
        data: finalData,
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
        color,
        id,
        data: scatterData,
        keySelector,
    } = settings;

    const [firstData, secondData] = useMemo(() => {
        if (!scatterData) {
            return [undefined, undefined];
        }
        return scatterData;
    }, [scatterData]);
    const newRef = useRef<HTMLDivElement>(null);

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

    const finalDataWithIndicators = useMemo(
        () => {
            if (!finalData) {
                return;
            }
            return finalData.map(f => {
                const indicatorKeys = Object.keys(f.indicators);
                if (indicatorKeys.length <= 0) {
                    return f;
                }
                const mappedIndicators = indicatorKeys.map(i => {
                    const strInd = `indicator_${i}`;
                    return {
                        [strInd]: f.indicators[i],
                    }
                });

                const [firstIndicator, secondIndicator] = mappedIndicators;
                return {
                    ...f,
                    ...firstIndicator,
                    ...secondIndicator,
                };
            }).filter(isDefined);
        },
        [finalData],
    );

    if (!firstData || !secondData) {
        return null;
    }
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
                        <ScatterChart
                            className={styles.chart}
                            margin={chartMargin}
                        >
                            <CartesianGrid />
                            <XAxis
                                dataKey={firstData.key}
                                type="number"
                                interval={0}
                                textAnchor="end"
                                name={firstData.title}
                                tickFormatter={hasLongTitles ? valueTickFormatter : undefined}
                                label={{
                                    value: firstData.title,
                                    offset: 0,
                                    position: 'insideBottom',
                                }}
                            />
                            <YAxis
                                type="number"
                                dataKey={secondData.key}
                                name={secondData.title}
                                tickFormatter={hasLongTitles ? valueTickFormatter : undefined}
                                label={{
                                    value: secondData.title,
                                    angle: -90,
                                    position: 'insideLeft',
                                }}
                            />
                            {/* FIXME: Show data on hover */}
                            <Tooltip
                                allowEscapeViewBox={{ x: false, y: false }}
                                offset={20}
                                formatter={valueTickFormatter}
                            />
                            <Scatter
                                name={title}
                                data={finalDataWithIndicators}
                                fill={color}
                            />
                        </ScatterChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
export default ScatterChartUnit;
