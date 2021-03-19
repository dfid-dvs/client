import React, { useCallback, useMemo, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    TickFormatterFunction,
} from 'recharts';
import { IoMdClose, IoMdDownload } from 'react-icons/io';
import { RiBarChartLine, RiBarChartHorizontalLine } from 'react-icons/ri';
import { AiOutlineEdit, AiOutlineExpandAlt } from 'react-icons/ai';
import { compareNumber, isNotDefined, isDefined, _cs, sum } from '@togglecorp/fujs';

import { formatNumber, getPrecision } from '#components/Numeral';
import Button from '#components/Button';
import SegmentInput from '#components/SegmentInput';
import { BarChartSettings } from '#types';
import handleChartDownload from '#utils/downloadChart';

import styles from './styles.css';

const orientations: {
    key: 'horizontal' | 'vertical';
    label: React.ReactNode;
    title: string;
}[] = [
    { key: 'vertical', label: <RiBarChartHorizontalLine />, title: 'Horizontal' },
    { key: 'horizontal', label: <RiBarChartLine />, title: 'Vertical' },
];


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

interface BarChartUnitProps<T> {
    settings: BarChartSettings<T>;
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

export function BarChartUnit<T extends object>(props: BarChartUnitProps<T>) {
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
    const {
        title,
        keySelector,
        bars,
        limit,
        id,
        orientation,
    } = settings;

    const [layout, setLayout] = useState<'horizontal' | 'vertical'>(orientation || 'vertical');
    const newRef = React.useRef<HTMLDivElement>(null);

    const Xcomp = layout === 'vertical' ? YAxis : XAxis;
    const Ycomp = layout === 'vertical' ? XAxis : YAxis;

    const isVertical = layout === 'vertical';
    const isHorizontal = layout === 'horizontal';

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


    const acceptableLength = layout === 'horizontal'
        ? 5
        : 15;

    const hasLongTitles = averageLength > acceptableLength;

    const handleDownload = useCallback(
        () => {
            handleChartDownload(newRef, title, styles.actions);
        },
        [title],
    );

    return (
        <div
            ref={newRef}
            className={_cs(styles.chartContainer, className)}
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
                        <SegmentInput
                            className={styles.segmentInput}
                            options={orientations}
                            optionKeySelector={item => item.key}
                            optionLabelSelector={item => item.label}
                            optionTitleSelector={item => item.title}
                            value={layout}
                            onChange={setLayout}
                        />
                    </div>
                )}
            </header>
            <div className={_cs(styles.responsiveContainer, chartClassName)}>
                {(finalData?.length || 0) > 0 && (
                    <ResponsiveContainer>
                        <BarChart
                            className={styles.chart}
                            data={finalData}
                            layout={layout}
                            margin={chartMargin}
                            barGap={0}
                        >
                            <CartesianGrid
                                strokeDasharray="0"
                                horizontal={isHorizontal}
                                vertical={isVertical}
                            />
                            <Xcomp
                                dataKey={keySelector}
                                type="category"
                                interval={0}
                                width={layout === 'vertical' ? 86 : undefined}
                                tickFormatter={hasLongTitles ? categoryTickFormatter : undefined}
                                angle={layout === 'horizontal' ? -45 : undefined}
                                textAnchor="end"
                            />
                            <Ycomp
                                type="number"
                                tickFormatter={valueTickFormatter}
                                interval={layout === 'vertical' ? 0 : undefined}
                                width={layout === 'horizontal' ? 36 : undefined}
                            />
                            <Tooltip
                                allowEscapeViewBox={{ x: false, y: false }}
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
                                    barSize={22}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
export default BarChartUnit;
