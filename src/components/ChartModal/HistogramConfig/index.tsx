import React, { useCallback, useMemo, useState } from 'react';
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

import { HistogramSettings, NumericOption } from '#types';
import styles from './styles.css';

interface Props<T> {
    onSave: (settings: HistogramSettings<T>) => void;
    className?: string;
    options: NumericOption<T>[];
    // keySelector: (item: T) => string;
    editableChartData: HistogramSettings<T> | undefined;
}

function HistogramConfig<T>(props: Props<T>) {
    const {
        onSave,
        className,
        options,
        // keySelector: primaryKeySelector,
        editableChartData,
    } = props;

    const [error, setError] = useState<string | undefined>(undefined);

    const [title, setTitle] = useState(editableChartData?.title ?? '');
    const [orderField, setOrderField] = useState<string | undefined>(editableChartData?.key ?? '');
    const [color, setColor] = useState(
        editableChartData?.color ?? (() => getRandomFromList(tableauColors)),
    );
    const [binCount, setBinCount] = useState(editableChartData?.binCount ?? '10');

    const keySelector = useMemo(() => (item: NumericOption<T>) => item.key, []);
    const labelSelector = useMemo(() => (item: NumericOption<T>) => item.title, []);
    const groupSelector = useMemo(() => (item: NumericOption<T>) => item.category, []);

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

            if (isFalsyString(binCount)) {
                setError('Total Bins field is required.');
                return;
            }

            const bins = +binCount;
            if (bins <= 1) {
                setError('Total Bins must be greater than one.');
                return;
            }

            const dependencies = option.dependency
                ? [option.dependency]
                : undefined;

            const settings: HistogramSettings<T> = {
                id: chartId,
                type: 'histogram',
                title,
                key: orderField,

                binCount: bins,
                color,

                valueSelector: option.valueSelector,
                dependencies,
            };

            onSave(settings);
        },
        [onSave, options, orderField, title, binCount, color],
    );

    return (
        <div className={_cs(className, styles.histogramConfig)}>
            <div className={styles.content}>
                <TextInput
                    label="Title"
                    value={title}
                    onChange={setTitle}
                    autoFocus
                    labelClassName={styles.label}
                />
                <SelectInput
                    label="Data"
                    options={options}
                    onChange={setOrderField}
                    value={orderField}
                    optionLabelSelector={labelSelector}
                    optionKeySelector={keySelector}
                    groupKeySelector={groupSelector}
                    nonClearable
                    labelClassName={styles.label}
                />
                <div className={styles.group}>
                    <NumberInput
                        label="Total bins"
                        value={binCount}
                        onChange={setBinCount}
                        labelClassName={styles.label}
                    />
                    <ColorInput
                        label="Color"
                        value={color}
                        onChange={setColor}
                        labelClassName={styles.label}
                    />
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
export default HistogramConfig;
