import React, { useCallback, useState } from 'react';
import {
    randomString,
    isFalsyString,
    isDefined,
    isTruthyString,
    getRandomFromList,
} from '@togglecorp/fujs';

import SelectInput from '#components/SelectInput';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import { ExtractKeys } from '#utils/common';

import { ExtendedFiveW } from '../../../../useExtendedFiveW';
import { BarChartSettings } from '../../PolyChart';
import styles from './styles.css';

type numericKeys = ExtractKeys<ExtendedFiveW, number>;

const colors = [
    '#003f5c',
    '#58508d',
    '#bc5090',
    '#ff6361',
    '#ffa600',
];

interface NumericOption {
    key: string;
    title: string;
    valueSelector: (value: ExtendedFiveW) => number;
}

const numericOptions: NumericOption[] = [
    {
        key: 'allocatedBudget',
        title: 'Allocated Budget',
        valueSelector: item => item.allocatedBudget,
    },
    {
        key: 'componentCount',
        title: '# of components',
        valueSelector: item => item.componentCount,
    },
    {
        key: 'partnerCount',
        title: '# of partners',
        valueSelector: item => item.partnerCount,
    },
    {
        key: 'sectorCount',
        title: '# of sectors',
        valueSelector: item => item.sectorCount,
    },
];

const keySelector = (item: NumericOption) => item.key;
const labelSelector = (item: NumericOption) => item.title;

interface Bar {
    id: string;
    optionName?: string;
    color: string;
}

interface BarItemProps {
    value: Bar;
    onValueChange: (val: (values: Bar[]) => Bar[]) => void;
    index: number;
}

function BarItem(props: BarItemProps) {
    const {
        index,
        value,
        onValueChange,
    } = props;

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
        <div>
            <SelectInput
                label={`Bar #${index}`}
                options={numericOptions}
                onChange={handleOptionNameChange}
                value={value.optionName}
                optionLabelSelector={labelSelector}
                optionKeySelector={keySelector}
            />
        </div>
    );
}

interface Props {
    onSave: (settings: BarChartSettings<ExtendedFiveW>) => void;
}

function BarChartConfig(props: Props) {
    const {
        onSave,
    } = props;

    const [title, setTitle] = useState('');
    const [error, setError] = useState<string | undefined>(undefined);
    const [bars, setBars] = useState<Bar[]>([
        {
            id: randomString(),
            color: getRandomFromList(colors),
        },
    ]);

    const handleSave = useCallback(
        () => {
            if (isFalsyString(title)) {
                setError('Title is required');
                return;
            }

            const properBars = bars.map((bar) => {
                const option = numericOptions.find(item => item.key === bar.optionName);

                if (!option) {
                    return undefined;
                }

                return {
                    title: option.title,
                    valueSelector: option.valueSelector,
                    color: bar.color,
                };
            }).filter(isDefined);

            if (bars.length <= 0) {
                setError('At least one bar is required');
                return;
            }

            // TODO: add indicators
            const settings: BarChartSettings<ExtendedFiveW> = {
                id: randomString(),
                type: 'bar-chart',
                title,

                keySelector: item => item.name,

                /*
                limit: {
                    count: 10,
                    method: 'max',
                    valueSelector: option.valueSelector,
                },
                */

                bars: properBars,
            };

            onSave(settings);
        },
        [onSave, bars, title],
    );

    const handleBarAdd = useCallback(
        () => {
            setBars(oldBars => [
                ...oldBars,
                {
                    id: randomString(),
                    color: getRandomFromList(colors),
                },
            ]);
        },
        [],
    );

    return (
        <div className={styles.barChart}>
            {isTruthyString(error) && (
                <span>{error}</span>
            )}
            <TextInput
                label="Title"
                value={title}
                onChange={setTitle}
            />
            {bars.map((bar, index) => (
                <BarItem
                    key={bar.id}
                    index={index}
                    value={bar}
                    onValueChange={setBars}
                />
            ))}
            <Button
                disabled={bars.length > 4}
                onClick={handleBarAdd}
            >
                Add Row
            </Button>
            <div>
                <Button
                    onClick={handleSave}
                    variant="primary"
                >
                    Save
                </Button>
            </div>
        </div>
    );
}
export default BarChartConfig;
