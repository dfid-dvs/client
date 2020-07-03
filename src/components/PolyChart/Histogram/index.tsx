import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { isNotDefined, isDefined, _cs, listToGroupList } from '@togglecorp/fujs';
import { IoMdTrash } from 'react-icons/io';

import Button from '#components/Button';
import { formatNumber, getPrecision } from '#components/Numeral';
import { HistogramSettings } from '#types';

import styles from './styles.css';

const valueTickFormatter = (value: number | string | undefined) => {
    if (isNotDefined(value)) {
        return '';
    }
    const numberValue = +value;
    const str = formatNumber(numberValue, true, true, getPrecision(numberValue));
    return str;
};

interface HistogramUnitProps<T> {
    settings: HistogramSettings<T>;
    data: T[] | undefined;
    className?: string;
    onDelete: (name: string | undefined) => void;
}

const chartMargin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
};

export function HistogramUnit<T extends object>(props: HistogramUnitProps<T>) {
    const {
        settings,
        data,
        className,
        onDelete,
    } = props;

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

    return (
        <div className={_cs(styles.chartContainer, className)}>
            <header className={styles.header}>
                <h3 className={styles.heading}>
                    {title}
                </h3>
                <div className={styles.actions}>
                    <Button
                        onClick={onDelete}
                        name={id}
                        title="Delete chart"
                        transparent
                        variant="danger"
                    >
                        <IoMdTrash />
                    </Button>
                </div>
            </header>
            <BarChart
                className={styles.chart}
                width={400}
                height={300}
                data={finalData}
                margin={chartMargin}
                barCategoryGap={0}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="key"
                    type="category"
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
                    offset={20}
                />
                <Bar
                    name="Frequency"
                    dataKey="value"
                    fill={color}
                />
            </BarChart>
        </div>
    );
}
export default HistogramUnit;
