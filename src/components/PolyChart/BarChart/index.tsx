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
    LabelList,
    TooltipProps,
    LabelProps,
} from 'recharts';
import { IoMdClose, IoMdDownload, IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { RiBarChartLine, RiBarChartHorizontalLine } from 'react-icons/ri';
import { AiOutlineEdit, AiOutlineExpandAlt, AiOutlineTag } from 'react-icons/ai';
import { compareNumber, isNotDefined, isDefined, _cs } from '@togglecorp/fujs';

import { formatNumber, getPrecision } from '#components/Numeral';
import Button from '#components/Button';
import SegmentInput from '#components/SegmentInput';
import { BarChartSettings } from '#types';
import handleChartDownload from '#utils/downloadChart';
import useBasicToggle from '#hooks/useBasicToggle';

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
    const [
        firstWord,
        ...remWords
    ] = words;
    const joinedRemWords = remWords.join(' ');
    // NOTE: words "Province", "District", "Municipality" removed from tickformatter for better UI
    const wordsWithoutAdministration = joinedRemWords.replace(/(province|district|municipality)/ig, '');
    return firstWord + wordsWithoutAdministration;
};

const valueTickFormatter: TickFormatterFunction = (value) => {
    if (isNotDefined(value)) {
        return '';
    }
    const numberValue = +value;
    const str = formatNumber(numberValue, true, true, getPrecision(numberValue));
    return str;
};

const renderCustomizedLabel = (verticalLayout: boolean) => (props: LabelProps) => {
    const { x = 0, y = 0, width = 0, height = 0, value = 0 } = props;
    const factor = verticalLayout ? height : width;
    const xValue = (verticalLayout ? x + height + width - 5 : x + width / 2);
    const yValue = (verticalLayout ? y + factor / 2 : y - factor / 4) + 1;
    return (
        <g>
            <text
                x={xValue}
                y={yValue}
                fill="#212121"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="0.8rem"
            >
                {valueTickFormatter(value)}
            </text>
        </g>
    );
};

const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (!payload || payload.length <= 0 || !active) {
        return null;
    }
    const {
        name: legendName,
        payload: {
            name: label,
        },
        value,
        color,
    } = payload[0];
    return (
        <div className={styles.customTooltip}>
            <div className={styles.label}>{label}</div>
            <div style={{ color }}>
                {`${legendName} : ${valueTickFormatter(value)}`}
            </div>
        </div>
    );
};

interface BarChartUnitProps<T> {
    settings: BarChartSettings<T>;
    data: T[] | undefined;
    className?: string;
    chartClassName?: string;
    headerClassName?: string;
    actionClassName?: string;
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
export function BarChartUnit<T extends object>(props: BarChartUnitProps<T>) {
    const {
        className,
        chartClassName,
        headerClassName,
        actionClassName,
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
        acronymSelector,
    } = settings;

    const [layout, setLayout] = useState<'horizontal' | 'vertical'>(orientation || 'vertical');
    const newRef = React.useRef<HTMLDivElement>(null);

    const Xcomp = layout === 'vertical' ? YAxis : XAxis;
    const Ycomp = layout === 'vertical' ? XAxis : YAxis;

    const isVertical = layout === 'vertical';
    const isHorizontal = layout === 'horizontal';

    const [allRegionHidden, , , toggleAllRegionHidden] = useBasicToggle();

    const finalData = useMemo(
        () => {
            if (!limit || !data) {
                return data;
            }
            return data
                .filter((datum) => {
                    const value = limit.valueSelector(datum);
                    const keyName = keySelector(datum);
                    const keyAllRegioned = keyName === 'All Province' || keyName === 'All District';
                    return keyAllRegioned ? isDefined(value) && value > 0 : isDefined(value);
                })
                .filter(isDefined)
                .sort((foo, bar) => compareNumber(
                    limit.valueSelector(foo),
                    limit.valueSelector(bar),
                    limit.method === 'max' ? -1 : 1,
                ))
                .slice(0, limit.count);
        },
        [data, limit, keySelector],
    );

    const filteredFinalData = useMemo(
        () => {
            if (!allRegionHidden) {
                return finalData;
            }
            return finalData?.filter(
                item => !(keySelector(item) === 'All Province' || keySelector(item) === 'All District'),
            );
        },
        [allRegionHidden, finalData, keySelector],
    );

    const hasAllRegion = useMemo(
        () => !!finalData?.find(
            d => keySelector(d) === 'All Province' || keySelector(d) === 'All District',
        ),
        [finalData, keySelector],
    );

    const xCompWidth = layout === 'horizontal' ? undefined : 86;

    const [labelShown, , , toggleLabelShown] = useBasicToggle();

    const handleDownload = useCallback(
        () => {
            handleChartDownload(newRef, title, styles.actions);
        },
        [title],
    );

    const labelContent = renderCustomizedLabel(layout === 'vertical');
    const xCompDataKey = acronymSelector ?? keySelector;

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
                    <div className={_cs(styles.actions, actionClassName)}>
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
                        <Button
                            onClick={toggleLabelShown}
                            name={id}
                            title={labelShown ? 'Hide Label' : 'View Label'}
                            transparent
                            variant="icon"
                        >
                            <AiOutlineTag
                                className={styles.expandIcon}
                            />
                        </Button>
                        {hasAllRegion && (
                            <Button
                                onClick={toggleAllRegionHidden}
                                name={id}
                                title={allRegionHidden ? 'Show Nation Wide Data' : 'Hide Nation Wide Data'}
                                transparent
                                variant="icon"
                            >
                                {allRegionHidden ? (
                                    <IoMdEye className={styles.expandIcon} />
                                ) : (
                                    <IoMdEyeOff className={styles.expandIcon} />
                                )}
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
                {(filteredFinalData?.length || 0) > 0 && (
                    <ResponsiveContainer>
                        <BarChart
                            className={styles.chart}
                            data={filteredFinalData}
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
                                dataKey={xCompDataKey}
                                type="category"
                                interval={0}
                                width={xCompWidth}
                                tickFormatter={categoryTickFormatter}
                                angle={layout === 'horizontal' ? -15 : undefined}
                                position="outside"
                            />
                            <Ycomp
                                type="number"
                                tickFormatter={valueTickFormatter}
                                width={layout === 'horizontal' ? 36 : undefined}
                                tickCount={6}
                            />
                            <Tooltip
                                allowEscapeViewBox={{ x: false, y: false }}
                                offset={20}
                                content={<CustomTooltip />}
                            />
                            <Legend
                                verticalAlign={layout === 'horizontal' ? 'top' : 'bottom'}
                            />
                            {bars.map(bar => (
                                <Bar
                                    key={bar.title}
                                    name={bar.title}
                                    dataKey={bar.valueSelector}
                                    fill={bar.color}
                                    stackId={bar.stackId}
                                >
                                    {labelShown && (
                                        <LabelList
                                            dataKey={bar.valueSelector}
                                            position={layout === 'vertical' ? 'right' : 'top'}
                                            formatter={valueTickFormatter}
                                            content={labelContent}
                                        />
                                    )}
                                </Bar>
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
export default BarChartUnit;
