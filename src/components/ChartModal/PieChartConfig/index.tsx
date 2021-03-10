import React, { useCallback, useState } from 'react';
import {
    randomString,
    isFalsyString,
    isTruthyString,
    _cs,
} from '@togglecorp/fujs';

import SelectInput from '#components/SelectInput';
import Button from '#components/Button';
import TextInput from '#components/TextInput';

import { PieChartSettings, NumericOption } from '#types';
import styles from './styles.css';

interface Props<T> {
    className?: string;
    onSave: (settings: PieChartSettings<T>) => void;
    options: NumericOption<T>[];
    keySelector: (item: T) => string;
    editableChartData: PieChartSettings<T> | undefined;
}

function PieChartConfig<T>(props: Props<T>) {
    const {
        className,
        onSave,
        options,
        keySelector: primaryKeySelector,
        editableChartData,
    } = props;
    const [error, setError] = useState<string | undefined>(undefined);

    const [title, setTitle] = useState(editableChartData ? editableChartData.title : '');
    const [orderField, setOrderField] = useState<string | undefined>(editableChartData ? editableChartData.key : '');

    // FIXME: memoize
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

            const dependencies = option.dependency
                ? [option.dependency]
                : undefined;

            const settings: PieChartSettings<T> = {
                id: chartId,
                type: 'pie-chart',
                title,
                key: orderField,

                keySelector: primaryKeySelector,
                valueSelector: option.valueSelector,
                dependencies,
            };

            onSave(settings);
        },
        [onSave, options, orderField, title, primaryKeySelector],
    );

    return (
        <div className={_cs(className, styles.pieChartConfig)}>
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
                    className={styles.fieldInput}
                    options={options}
                    onChange={setOrderField}
                    value={orderField}
                    optionLabelSelector={labelSelector}
                    optionKeySelector={keySelector}
                    groupKeySelector={groupSelector}
                    nonClearable
                    labelClassName={styles.label}
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
export default PieChartConfig;
