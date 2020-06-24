import React, { useCallback, useState, useMemo } from 'react';
import {
    randomString,
    isFalsyString,
    unique,
    isDefined,
    isTruthyString,
    getRandomFromList,
} from '@togglecorp/fujs';
import { IoMdTrash } from 'react-icons/io';

import SelectInput from '#components/SelectInput';
import SegmentInput from '#components/SegmentInput';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import NumberInput from '#components/NumberInput';
import { ExtractKeys } from '#utils/common';
import { Indicator } from '#types';

import { ExtendedFiveW } from '../../../../useExtendedFiveW';
import { BarChartSettings } from '../../PolyChart';
import styles from './styles.css';

type numericKeys = ExtractKeys<ExtendedFiveW, number>;

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

type BarTypeKeys = 'normal' | 'stacked';

interface BarTypeOption {
    key: BarTypeKeys;
    title: string;
}

const barTypeOptions: BarTypeOption[] = [
    {
        key: 'normal',
        title: 'Normal',
    },
    {
        key: 'stacked',
        title: 'Stacked',
    },
];

const barTypeKeySelector = (item: BarTypeOption) => item.key;
const barTypeLabelSelector = (item: BarTypeOption) => item.title;

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

interface Bar {
    id: string;
    optionName?: string;
    color: string;
}

interface BarItemProps {
    value: Bar;
    onValueChange: (val: (values: Bar[]) => Bar[]) => void;
    index: number;
    options: NumericOption[];
}

function BarItem(props: BarItemProps) {
    const {
        index,
        value,
        onValueChange,
        options,
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

    const handleColorChange = useCallback(
        (color: string) => {
            onValueChange((values) => {
                const newValues = [...values];
                newValues[index] = {
                    ...newValues[index],
                    color,
                };
                return newValues;
            });
        },
        [onValueChange, index],
    );

    const handleDelete = useCallback(
        () => {
            onValueChange((values) => {
                const newValues = [...values];
                newValues.splice(index, 1);
                return newValues;
            });
        },
        [onValueChange, index],
    );

    return (
        <div className={styles.bar}>
            <SelectInput
                className={styles.select}
                label={`Bar #${index + 1}`}
                options={options}
                onChange={handleOptionNameChange}
                value={value.optionName}
                optionLabelSelector={labelSelector}
                optionKeySelector={keySelector}
                groupKeySelector={groupSelector}
                nonClearable
            />
            <TextInput
                className={styles.colorSelect}
                label="Color"
                onChange={handleColorChange}
                value={value.color}
            />
            <Button
                className={styles.trashButton}
                onClick={handleDelete}
                title="Delete bar"
                disabled={index <= 0}
                transparent
                variant="danger"
            >
                <IoMdTrash />
            </Button>
        </div>
    );
}

interface Props {
    onSave: (settings: BarChartSettings<ExtendedFiveW>) => void;
    indicatorList: Indicator[] | undefined;
    maxRow?: number;
}

function BarChartConfig(props: Props) {
    const {
        onSave,
        indicatorList,
        maxRow = 4,
    } = props;

    const [error, setError] = useState<string | undefined>(undefined);

    const [title, setTitle] = useState('');
    const [barType, setBarType] = useState<BarTypeKeys>('normal');
    const [bars, setBars] = useState<Bar[]>([
        {
            id: randomString(),
            color: getRandomFromList(colors),
        },
    ]);
    const [limitValue, setLimitValue] = useState<string>('7');
    const [order, setOrder] = useState<OrderOptionKey | undefined>('asc');
    const [orderField, setOrderField] = useState<string | undefined>();

    // NOTE: there is always at least one bar
    const autoOrderField = isDefined(orderField)
        ? orderField
        : bars[0].optionName;

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

            const properBars = bars.map((bar) => {
                const option = options.find(item => item.key === bar.optionName);

                if (!option) {
                    return undefined;
                }

                return {
                    title: option.title,
                    valueSelector: option.valueSelector,
                    color: bar.color,
                    dependency: option.dependency,
                    stackId: barType === 'stacked' ? chartId : undefined,
                };
            }).filter(isDefined);

            if (properBars.length <= 0) {
                setError('At least one bar should be set.');
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

            if (isFalsyString(autoOrderField)) {
                setError('Field to order data points is required.');
                return;
            }

            const orderOption = options.find(item => item.key === autoOrderField);
            if (!orderOption) {
                setError('Field to order data points is required.');
                return;
            }

            const dependencies = unique(
                properBars.map(item => item.dependency).filter(isDefined),
                item => item,
            );

            // TODO: add indicators
            const settings: BarChartSettings<ExtendedFiveW> = {
                id: chartId,
                type: 'bar-chart',
                title,

                keySelector: item => item.name,

                limit: {
                    count: limit,
                    method: order === 'asc' ? 'min' : 'max',
                    valueSelector: orderOption.valueSelector,
                },

                bars: properBars,

                dependencies,
            };

            onSave(settings);
        },
        [onSave, bars, title, options, barType, limitValue, order, autoOrderField],
    );

    const handleBarAdd = useCallback(
        () => {
            setBars((oldBars) => {
                const usedColors = new Set(
                    oldBars.map(item => item.color).filter(isDefined),
                );
                const unusedColors = colors.filter(color => !usedColors.has(color));

                return [
                    ...oldBars,
                    {
                        id: randomString(),
                        color: getRandomFromList(unusedColors),
                    },
                ];
            });
        },
        [],
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
                <SegmentInput
                    label="Type"
                    options={barTypeOptions}
                    onChange={setBarType}
                    value={barType}
                    optionLabelSelector={barTypeLabelSelector}
                    optionKeySelector={barTypeKeySelector}
                />
                <div className={styles.barsHeader}>
                    <h3 className={styles.header}>
                        Bars
                    </h3>
                    <Button
                        className={styles.addButton}
                        disabled={bars.length > maxRow}
                        onClick={handleBarAdd}
                    >
                        Add Bar
                    </Button>
                </div>
                <div className={styles.bars}>
                    {bars.map((bar, index) => (
                        <BarItem
                            key={bar.id}
                            index={index}
                            value={bar}
                            onValueChange={setBars}
                            options={options}
                        />
                    ))}
                </div>
                <div
                    className={styles.checkboxLabel}
                >
                    <span>
                        Show
                    </span>
                    <NumberInput
                        inputContainerClassName={styles.limitInput}
                        onChange={setLimitValue}
                        value={limitValue}
                        placeholder="N"
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
                    />
                    <span>
                        order by
                    </span>
                    <SelectInput
                        className={styles.fieldInput}
                        options={options}
                        onChange={setOrderField}
                        value={autoOrderField}
                        optionLabelSelector={labelSelector}
                        optionKeySelector={keySelector}
                        groupKeySelector={groupSelector}
                        nonClearable
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
                    variant="primary"
                >
                    Save
                </Button>
            </div>
        </div>
    );
}
export default BarChartConfig;
