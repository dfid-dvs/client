import React, { useCallback, useMemo, useState } from 'react';
import {
    randomString,
    isFalsyString,
    isTruthyString,
    getRandomFromList,
    _cs,
    isDefined,
    unique,
} from '@togglecorp/fujs';

import SelectInput from '#components/SelectInput';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import ColorInput from '#components/ColorInput';
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

interface ScatterData{
    id: string;
    optionName?: string;
}

interface BiAxialChartItemProps<T> {
    value: ScatterData;
    onValueChange: (val: (values: ScatterData[]) => ScatterData[]) => void;
    index: number;
    options: NumericOption<T>[];
}

function ScatterChartItem<T>(props: BiAxialChartItemProps<T>) {
    const {
        index,
        value,
        onValueChange,
        options,
    } = props;

    // FIXME: memoize
    const keySelector = (item: NumericOption<T>) => item.key;
    const labelSelector = (item: NumericOption<T>) => item.title;
    const groupSelector = (item: NumericOption<T>) => item.category;

    const handleOptionNameChange = useCallback(
        (optionName: string | undefined) => {
            onValueChange((values) => {
                const newValues = [...values];
                newValues[index] = {
                    ...newValues[index],
                    optionName,
                };
                return newValues;
            });
        },
        [onValueChange, index],
    );

    return (
        <div className={styles.dataBar}>
            <SelectInput
                className={styles.select}
                label={`Data #${index + 1}`}
                options={options}
                onChange={handleOptionNameChange}
                value={value.optionName}
                optionLabelSelector={labelSelector}
                optionKeySelector={keySelector}
                groupKeySelector={groupSelector}
                nonClearable
                labelClassName={styles.label}
                showDropDownIcon
            />
        </div>
    );
}

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
        editableChartData?.color ? editableChartData.color : () => getRandomFromList(tableauColors),
    );

    const scatterChartData: ScatterData[] = useMemo(
        () => {
            const defaultData: ScatterData[] = [
                {
                    id: randomString(),
                },
                {
                    id: randomString(),
                },
            ];
            if (editableChartData) {
                const editableData = editableChartData.data;
                if (!editableData) {
                    return defaultData;
                }
                const mappedData = editableData.map((e) => {
                    const opt = options.find(o => o.key === e.key);
                    if (!opt) {
                        return undefined;
                    }
                    return {
                        id: randomString(),
                        optionName: opt.key,
                    };
                }).filter(isDefined);
                if (mappedData.length <= 0) {
                    return defaultData;
                }
                if (mappedData.length === 1) {
                    return [
                        ...mappedData,
                        defaultData[0],
                    ];
                }
                const [firstDataValue, secondDataValue] = mappedData;
                return [firstDataValue, secondDataValue];
            }
            return defaultData;
        },
        [editableChartData, options],
    );

    const [scatterData, setScatterData] = useState<ScatterData[]>(scatterChartData);

    const handleSave = useCallback(
        () => {
            if (isFalsyString(title)) {
                setError('Title field is required.');
                return;
            }

            const chartId = randomString();

            const properScatterData = scatterData.map((data) => {
                const option = options.find(item => item.key === data.optionName);

                if (!option) {
                    return undefined;
                }

                return {
                    title: option.title,
                    valueSelector: option.valueSelector,
                    key: data.optionName,
                    dependency: option.dependency,
                };
            }).filter(isDefined);

            if (properScatterData.length <= 1) {
                setError('Two data should be set.');
                return;
            }

            if (isFalsyString(color)) {
                setError('Color field is required.');
                return;
            }


            const nonUniqueDependencies = properScatterData.map(
                item => item.dependency,
            ).filter(isDefined);

            const dependencies = unique(
                nonUniqueDependencies.filter(isDefined),
                item => item,
            );

            const settings: ScatterChartSettings<T> = {
                id: chartId,
                type: 'scatter-chart',
                title,
                keySelector: primaryKeySelector,
                color,
                data: properScatterData,
                dependencies,
            };

            onSave(settings);
        },
        [onSave, options, title, color, primaryKeySelector, scatterData],
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
                        {scatterData.map((data, index) => (
                            <ScatterChartItem
                                key={data.id}
                                index={index}
                                value={data}
                                onValueChange={setScatterData}
                                options={options}
                            />
                        ))}
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
