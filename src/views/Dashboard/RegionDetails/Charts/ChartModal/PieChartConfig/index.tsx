import React, { useCallback, useState, useMemo } from 'react';
import {
    randomString,
    isFalsyString,
    isTruthyString,
    _cs,
} from '@togglecorp/fujs';

import SelectInput from '#components/SelectInput';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import { Indicator } from '#types';

import { ExtendedFiveW } from '../../../../useExtendedFiveW';
import { PieChartSettings } from '../../types';
import styles from './styles.css';

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
        key: 'programCount',
        title: '# of programs',
        valueSelector: item => item.programCount,
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
    className?: string;
    onSave: (settings: PieChartSettings<ExtendedFiveW>) => void;
    indicatorList: Indicator[] | undefined;
}

function PieChartConfig(props: Props) {
    const {
        className,
        onSave,
        indicatorList,
    } = props;

    const [error, setError] = useState<string | undefined>(undefined);

    const [title, setTitle] = useState('');
    const [orderField, setOrderField] = useState<string | undefined>();

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

            const dependencies = option.dependency
                ? [option.dependency]
                : undefined;

            const settings: PieChartSettings<ExtendedFiveW> = {
                id: chartId,
                type: 'pie-chart',
                title,

                keySelector: item => item.name,
                valueSelector: option.valueSelector,
                dependencies,
            };

            onSave(settings);
        },
        [onSave, options, orderField, title],
    );

    return (
        <div className={_cs(className, styles.pieChartConfig)}>
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
export default PieChartConfig;
