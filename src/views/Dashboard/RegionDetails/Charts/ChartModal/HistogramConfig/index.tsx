import React, { useCallback, useState, useMemo } from 'react';
import {
    randomString,
    isFalsyString,
    isTruthyString,
    getRandomFromList,
} from '@togglecorp/fujs';

import SelectInput from '#components/SelectInput';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import NumberInput from '#components/NumberInput';
import { ExtractKeys } from '#utils/common';
import { Indicator } from '#types';

import { ExtendedFiveW } from '../../../../useExtendedFiveW';
import { HistogramSettings } from '../../types';
import styles from './styles.css';

type numericKeys = ExtractKeys<ExtendedFiveW, number>;

// FIXME: move this somewhere
const colors = [
    '#4e79a7',
    '#f28e2c',
    '#e15759',
    '#76b7b2',
    '#59a14f',
    '#edc949',
    '#af7aa1',
    '#ff9da7',
    '#9c755f',
    '#bab0ab',
];

interface NumericOption {
    key: string;
    title: string;
    valueSelector: (value: ExtendedFiveW) => number;
    dependency?: number;
    category: string;
}

const numericOptions: NumericOption[] = [
    {
        key: 'allocatedBudget',
        title: 'Allocated Budget',
        valueSelector: item => item.allocatedBudget,
        category: 'DFID Data',
    },
    {
        key: 'componentCount',
        title: '# of components',
        valueSelector: item => item.componentCount,
        category: 'DFID Data',
    },
    {
        key: 'partnerCount',
        title: '# of partners',
        valueSelector: item => item.partnerCount,
        category: 'DFID Data',
    },
    {
        key: 'sectorCount',
        title: '# of sectors',
        valueSelector: item => item.sectorCount,
        category: 'DFID Data',
    },
];

const keySelector = (item: NumericOption) => item.key;
const labelSelector = (item: NumericOption) => item.title;
const groupSelector = (item: NumericOption) => item.category;

interface Props {
    onSave: (settings: HistogramSettings<ExtendedFiveW>) => void;
    indicatorList: Indicator[] | undefined;
}

function HistogramConfig(props: Props) {
    const {
        onSave,
        indicatorList,
    } = props;

    const [error, setError] = useState<string | undefined>(undefined);

    const [title, setTitle] = useState('');
    const [orderField, setOrderField] = useState<string | undefined>();
    const [color, setColor] = useState(() => getRandomFromList(colors));
    const [binCount, setBinCount] = useState('10');

    const options: NumericOption[] = useMemo(
        () => {
            if (!indicatorList) {
                return numericOptions;
            }
            return [
                ...numericOptions,
                ...indicatorList.map(indicator => ({
                    key: `indicator_${indicator.id}`,
                    title: indicator.fullTitle,
                    // FIXME: we should have certain thing for this
                    valueSelector: (item: ExtendedFiveW) => item.indicators[indicator.id] || 0,

                    category: indicator.category,

                    dependency: indicator.id,
                })),
            ];
        },
        [indicatorList],
    );

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

            const settings: HistogramSettings<ExtendedFiveW> = {
                id: chartId,
                type: 'histogram',
                title,

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
        <div className={styles.barChart}>
            <div className={styles.content}>
                <TextInput
                    label="Title"
                    value={title}
                    onChange={setTitle}
                    autoFocus
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
                />
                <NumberInput
                    label="Total bins"
                    value={binCount}
                    onChange={setBinCount}
                />
                <TextInput
                    label="Color"
                    value={color}
                    onChange={setColor}
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
                    variant="primary"
                >
                    Save
                </Button>
            </div>
        </div>
    );
}
export default HistogramConfig;
