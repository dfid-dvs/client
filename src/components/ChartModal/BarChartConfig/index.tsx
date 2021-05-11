import React, { useCallback, useMemo, useState } from 'react';
import {
    randomString,
    isFalsyString,
    unique,
    isDefined,
    isTruthyString,
    getRandomFromList,
    _cs,
} from '@togglecorp/fujs';
import { IoMdAddCircleOutline, IoMdClose } from 'react-icons/io';

import SelectInput from '#components/SelectInput';
import SegmentInput from '#components/SegmentInput';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import ColorInput from '#components/ColorInput';
import NumberInput from '#components/NumberInput';
import { tableauColors } from '#utils/constants';

import { BarChartSettings, NumericOption } from '#types';
import styles from './styles.css';

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

interface Bar {
    id: string;
    optionName?: string;
    color: string;
}

interface BarItemProps<T> {
    value: Bar;
    onValueChange: (val: (values: Bar[]) => Bar[]) => void;
    index: number;
    options: NumericOption<T>[];
}

function BarItem<T>(props: BarItemProps<T>) {
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
                label={`Data #${index + 1}`}
                options={options}
                onChange={handleOptionNameChange}
                value={value.optionName}
                optionLabelSelector={labelSelector}
                optionKeySelector={keySelector}
                groupKeySelector={groupSelector}
                nonClearable
                labelClassName={styles.label}
            />
            <ColorInput
                className={styles.colorSelect}
                label="Color"
                onChange={handleColorChange}
                value={value.color}
                labelClassName={styles.label}
            />
            <Button
                className={styles.trashButton}
                onClick={handleDelete}
                title="Delete bar"
                disabled={index <= 0}
                transparent
                variant="icon"
            >
                <IoMdClose fontSize={18} />
            </Button>
        </div>
    );
}

interface Props<T> {
    onSave: (settings: BarChartSettings<T>) => void;
    // indicatorList: Indicator[] | undefined;
    maxRow?: number;
    className?: string;
    options: NumericOption<T>[];
    keySelector: (item: T) => string;
    editableChartData: BarChartSettings<T> | undefined;
}

function BarChartConfig<T>(props: Props<T>) {
    const {
        onSave,
        // indicatorList,
        className,
        maxRow = 4,
        options,
        keySelector: primaryKeySelector,
        editableChartData,
    } = props;

    // FIXME: memoize
    const keySelector = (item: NumericOption<T>) => item.key;
    const labelSelector = (item: NumericOption<T>) => item.title;
    const groupSelector = (item: NumericOption<T>) => item.category;

    const [error, setError] = useState<string | undefined>(undefined);

    const [title, setTitle] = useState(editableChartData ? editableChartData.title : '');

    const [
        barType,
        setBarType,
    ] = useState<BarTypeKeys>(
        editableChartData?.bars?.find(f => !!f.stackId) ? 'stacked' : 'normal',
    );
    const barData: Bar[] = useMemo(() => {
        const defaultBar: Bar[] = [{
            id: randomString(),
            color: getRandomFromList(tableauColors),
        }];

        if (editableChartData) {
            const editableBars = editableChartData.bars;
            if (!editableBars) {
                return defaultBar;
            }
            const mappedBars = editableBars.map((e) => {
                const opt = options.find(o => o.key === e.key);
                if (!opt) {
                    return undefined;
                }
                return {
                    color: e.color,
                    id: randomString(),
                    optionName: opt.key,
                };
            }).filter(isDefined);
            if (mappedBars.length <= 0) {
                return defaultBar;
            }

            return mappedBars;
        }
        return defaultBar;
    }, [editableChartData, options]);

    const [bars, setBars] = useState<(Bar)[]>(barData);

    const [
        limitValue,
        setLimitValue,
    ] = useState<string>(
        editableChartData?.limit?.count ? String(editableChartData.limit.count) : '8',
    );
    const [order, setOrder] = useState<OrderOptionKey | undefined>('asc');
    const [orderField, setOrderField] = useState<string | undefined>();

    // NOTE: there is always at least one bar
    const autoOrderField = isDefined(orderField)
        ? orderField
        : bars[0].optionName;

    /*
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
                    valueSelector: (item: T) => item.indicators[indicator.id] || 0,

                    category: indicator.category,

                    dependency: indicator.id,
                })),
            ];
        },
        [indicatorList],
    );
    */

    const handleSave = useCallback(
        () => {
            if (isFalsyString(title)) {
                setError('Title field is required.');
                return;
            }

            const chartId = editableChartData ? editableChartData.id : randomString();

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
                    stackId: barType === 'stacked' ? editableChartData?.id : undefined,
                    key: bar.optionName,
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

            const nonUniqueDependencies = properBars.map(item => item.dependency);
            if (orderOption) {
                nonUniqueDependencies.push(orderOption.dependency);
            }
            const dependencies = unique(
                nonUniqueDependencies.filter(isDefined),
                item => item,
            );

            const settings: BarChartSettings<T> = {
                id: chartId,
                type: 'bar-chart',
                title,

                keySelector: primaryKeySelector,

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
        [
            editableChartData, onSave, bars, title, options, barType, limitValue,
            order, autoOrderField, primaryKeySelector,
        ],
    );

    const handleBarAdd = useCallback(
        () => {
            setBars((oldBars) => {
                const usedColors = new Set(
                    oldBars.map(item => item.color).filter(isDefined),
                );
                const unusedColors = tableauColors.filter(color => !usedColors.has(color));

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
        <div className={_cs(className, styles.barChartConfig)}>
            <div className={styles.content}>
                <section className={styles.topSection}>
                    <TextInput
                        label="Title"
                        value={title}
                        onChange={setTitle}
                        autoFocus
                        labelClassName={styles.label}
                    />
                    <SegmentInput
                        label="Type"
                        options={barTypeOptions}
                        onChange={setBarType}
                        value={barType}
                        optionLabelSelector={barTypeLabelSelector}
                        optionKeySelector={barTypeKeySelector}
                        labelClassName={styles.label}
                        className={styles.typeInput}
                        segmentClassName={styles.segment}
                    />
                </section>
                <section className={styles.barSection}>
                    <div className={styles.barsHeader}>
                        <h3 className={styles.header}>
                            Data
                        </h3>
                        <Button
                            className={styles.addButton}
                            disabled={bars.length > maxRow}
                            onClick={handleBarAdd}
                            transparent
                            variant="icon"
                            icons={<IoMdAddCircleOutline className={styles.icon} />}
                        >
                            <div className={styles.text}>
                                Add Data
                            </div>
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
                </section>
                <section className={styles.barDataOptionSection}>
                    <div className={styles.barDataOption}>
                        <span>
                            Show
                        </span>
                        <NumberInput
                            inputContainerClassName={styles.limitInput}
                            onChange={setLimitValue}
                            value={limitValue}
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
                            showDropDownIcon
                        />
                    </div>
                </section>
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
export default BarChartConfig;
