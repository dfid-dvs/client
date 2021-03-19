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
    const [color, setColor] = useState(
        editableChartData ? editableChartData.color : () => getRandomFromList(tableauColors),
    );
    const [
        firstData,
        setFirstData,
    ] = useState<string | undefined>(editableChartData?.data[0]?.key);
    const [
        secondData,
        setSecondData,
    ] = useState<string| undefined>(editableChartData?.data[1]?.key);

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

            const firstOption = options.find(item => item.key === firstData);
            const secondOption = options.find(item => item.key === secondData);

            if (isFalsyString(color)) {
                setError('Color field is required.');
                return;
            }

            if (isFalsyString(firstOption) || isFalsyString(secondOption)) {
                setError('Data is required.');
                return;
            }

            const dependencies = firstOption?.dependency
                ? [firstOption.dependency]
                : undefined;

            const settings: ScatterChartSettings<T> = {
                id: chartId,
                type: 'scatter-chart',
                title,
                keySelector: primaryKeySelector,
                color,
                dependencies,
                data: [
                    {
                        title: firstOption.title,
                        valueSelector: firstOption.valueSelector,
                        key: firstOption.key,
                    },
                    {
                        title: secondOption.title,
                        valueSelector: secondOption.valueSelector,
                        key: secondOption.key,
                    },
                ],
            };

            onSave(settings);
        },
        [onSave, options, title, color, firstData, secondData],
    );
    return (
        <div className={_cs(className, styles.scatterChartConfig)}>
            <div className={styles.content}>
                <section className={styles.topSection}>
                    <TextInput
                        label="Title"
                        value={title}
                        onChange={setTitle}
                        autoFocus
                        labelClassName={styles.label}
                        placeholder="Title"
                    />
                </section>
                <section className={styles.dataSection}>
                    <div className={styles.barsHeader}>
                        <h3 className={styles.header}>
                            Data
                        </h3>
                    </div>
                    <div className={styles.dataGroup}>
                        <SelectInput
                            label="Data#1"
                            className={styles.select}
                            options={options}
                            onChange={setFirstData}
                            value={firstData}
                            optionLabelSelector={labelSelector}
                            optionKeySelector={keySelector}
                            groupKeySelector={groupSelector}
                            nonClearable
                            labelClassName={styles.label}
                        />
                        <SelectInput
                            label="Data#2"
                            className={styles.select}
                            options={options}
                            onChange={setSecondData}
                            value={secondData}
                            optionLabelSelector={labelSelector}
                            optionKeySelector={keySelector}
                            groupKeySelector={groupSelector}
                            nonClearable
                            labelClassName={styles.label}
                        />
                    </div>
                </section>
                <ColorInput
                    label="Color"
                    value={color}
                    onChange={setColor}
                    labelClassName={styles.label}
                    className={styles.colorSelect}
                />
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
