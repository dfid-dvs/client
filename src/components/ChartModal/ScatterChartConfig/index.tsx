import React, { useCallback, useState } from 'react';
import {
    randomString,
    isFalsyString,
    isTruthyString,
    getRandomFromList,
    _cs,
} from '@togglecorp/fujs';

import SelectInput from '#components/SelectInput';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import ColorInput from '#components/ColorInput';
import NumberInput from '#components/NumberInput';
import { tableauColors } from '#utils/constants';

import { ScatterChartSettings, NumericOption } from '#types';
import styles from './styles.css';

interface Props<T> {
    onSave: (settings: ScatterChartSettings<T>) => void;
    className?: string;
    options: NumericOption<T>[];
    keySelector: (item: T) => string;
    editableChartData: ScatterChartSettings<T> | undefined;
}

type OrderOptionKey = 'asc' | 'dsc';

interface OrderOption {
    key: OrderOptionKey;
    title: string;
}

const orderOptions: OrderOption[] = [
    { key: 'asc', title: 'ascending' },
    { key: 'dsc', title: 'descending' },
];

const orderKeySelector = (item: OrderOption) => item.key;
const orderLabelSelector = (item: OrderOption) => item.title;

function ScatterChartConfig<T>(props: Props<T>) {
    const {
        onSave,
        className,
        options,
        keySelector: primaryKeySelector,
        editableChartData,
    } = props;

    const [error, setError] = useState<string | undefined>(undefined);

    const [title, setTitle] = useState(editableChartData ? editableChartData.title : '');
    const [orderField, setOrderField] = useState<string | undefined>(editableChartData ? editableChartData.key : '');
    const [order, setOrder] = useState<OrderOptionKey | undefined>('asc');
    const [color, setColor] = useState(
        editableChartData ? editableChartData.color : () => getRandomFromList(tableauColors),
    );
    const [limitValue, setLimitValue] = useState(editableChartData ? editableChartData.limit?.count : '10');

    const keySelector = (item: NumericOption<T>) => item.key;
    const labelSelector = (item: NumericOption<T>) => item.title;
    const groupSelector = (item: NumericOption<T>) => item.category;

    const handleSave = useCallback(
        () => {
            if (isFalsyString(title)) {
                setError('Title field is required.');
                return;
            }

            const chartId = randomString();

            if (isFalsyString(orderField)) {
                setError('Data field is required.');
                return;
            }

            const option = options.find(item => item.key === orderField);
            if (!option) {
                setError('Data field is required.');
                return;
            }

            if (isFalsyString(color)) {
                setError('Color field is required.');
                return;
            }

            if (isFalsyString(limitValue)) {
                setError('Limit value on data points is required.');
                return;
            }

            const limit = +limitValue;
            if (limit <= 0) {
                setError('Limit value must be greater than zero.');
                return;
            }

            const dependencies = option.dependency
                ? [option.dependency]
                : undefined;

            const settings: ScatterChartSettings<T> = {
                id: chartId,
                type: 'scatter-chart',
                title,
                key: orderField,
                keySelector: primaryKeySelector,

                limit: {
                    count: limit,
                    method: order === 'asc' ? 'min' : 'max',
                },
                color,

                valueSelector: option.valueSelector,
                dependencies,
            };

            onSave(settings);
        },
        [onSave, options, orderField, title, limitValue, color],
    );

    return (
        <div className={_cs(className, styles.scatterChartConfig)}>
            <div className={styles.content}>
                <TextInput
                    label="Title"
                    value={title}
                    onChange={setTitle}
                    autoFocus
                    labelClassName={styles.label}
                />
                <div className={styles.dataColorGroup}>
                    <SelectInput
                        label="Data"
                        className={styles.select}
                        options={options}
                        onChange={setOrderField}
                        value={orderField}
                        optionLabelSelector={labelSelector}
                        optionKeySelector={keySelector}
                        groupKeySelector={groupSelector}
                        nonClearable
                        labelClassName={styles.label}
                    />
                    <ColorInput
                        label="Color"
                        value={color}
                        onChange={setColor}
                        labelClassName={styles.label}
                        className={styles.colorSelect}
                    />
                </div>
                <div className={styles.group}>
                    <span>
                        Show
                    </span>
                    <NumberInput
                        value={limitValue}
                        onChange={setLimitValue}
                        inputContainerClassName={styles.limitInput}
                        placeholder="N"
                        className={styles.limitInput}
                    />
                    <span>
                        data points in
                    </span>
                    <SelectInput
                        className={styles.orderInput}
                        options={orderOptions}
                        onChange={setOrder}
                        value={order}
                        optionLabelSelector={orderLabelSelector}
                        optionKeySelector={orderKeySelector}
                        nonClearable
                        showDropDownIcon
                    />
                    <span>
                        order
                    </span>
                </div>
            </div>
            <div className={styles.footer}>
                <div className={styles.error}>
                    {isTruthyString(error) && (
                        <span>{error}</span>
                    )}
                </div>
                <Button
                    className={styles.submitButton}
                    onClick={handleSave}
                    variant="secondary"
                >
                    Save
                </Button>
            </div>
        </div>
    );
}
export default ScatterChartConfig;
