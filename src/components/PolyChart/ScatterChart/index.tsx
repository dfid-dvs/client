import React, { useCallback, useMemo } from 'react';
import {
    ScatterChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Scatter,
    TooltipFormatter,
} from 'recharts';
import { isNotDefined, isDefined, _cs, compareNumber, sum } from '@togglecorp/fujs';
import { IoMdClose, IoMdDownload } from 'react-icons/io';
import { AiOutlineEdit, AiOutlineExpandAlt } from 'react-icons/ai';
import FileSaver from 'file-saver';
import html2canvas from 'html2canvas';

import Button from '#components/Button';
import { formatNumber, getPrecision } from '#components/Numeral';
import { ScatterChartSettings } from '#types';

import styles from './styles.css';

interface RechartRef {
    container: HTMLDivElement;
}

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

export function ScatterChartUnit<T extends object>(props: ScatterChartUnitProps<T>) {
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
        color,
        id,
        limit,
        keySelector,
        valueSelector,
    } = settings;

    const newRef = React.useRef<ScatterChart>(null);

    const finalData = useMemo(
        () => {
            if (!limit || !data) {
                return data;
            }
            return data
                .filter(datum => isDefined(valueSelector(datum)))
                .sort((foo, bar) => compareNumber(
                    valueSelector(foo),
                    valueSelector(bar),
                    limit.method === 'max' ? -1 : 1,
                ))
                .slice(0, limit.count);
        },
        [data, limit, valueSelector],
    );

    const averageLength: number = useMemo(() => {
        if (finalData) {
            return sum(finalData.map(item => keySelector(item).length)) / finalData.length;
        }
        return 0;
    }, [finalData, keySelector]);

    const hasLongTitles = averageLength > 5;

    const handleDownload = useCallback(
        async () => {
            const png = await html2canvas(
                (newRef?.current as unknown as RechartRef)?.container,
            ).then(canvas => canvas.toDataURL('image/png', 1.0));
            FileSaver.saveAs(png, `${title}.png`);
        },
        [title],
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
                    </div>
                )}
            </header>
            <div className={_cs(styles.responsiveContainer, chartClassName)}>
                {(finalData?.length || 0) > 0 && (
                    <ResponsiveContainer>
                        <ScatterChart
                            className={styles.chart}
                            margin={chartMargin}
                            ref={newRef}
                        >
                            <CartesianGrid />
                            <XAxis
                                dataKey={keySelector}
                                type="category"
                                interval={0}
                                textAnchor="end"
                                tickFormatter={hasLongTitles ? categoryTickFormatter : undefined}
                                name="Key"
                            />
                            <YAxis
                                type="number"
                                dataKey={valueSelector}
                                name="Value"
                            />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter
                                name={title}
                                data={finalData}
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
