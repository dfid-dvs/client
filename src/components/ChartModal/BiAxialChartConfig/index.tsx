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

import SelectInput from '#components/SelectInput';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import ColorInput from '#components/ColorInput';
import NumberInput from '#components/NumberInput';
import { tableauColors } from '#utils/constants';
import SegmentInput from '#components/SegmentInput';

import { BiAxialChartSettings, NumericOption } from '#types';
import styles from './styles.css';

type BiAxialChartDataType = 'line' | 'bar';

interface DataTypeOption {
    key: BiAxialChartDataType;
    title: string;
}

const dataTypeOptions: DataTypeOption[] = [
    {
        key: 'line',
        title: 'Line',
    },
    {
        key: 'bar',
        title: 'Bar',
    },
];

const dataTypeKeySelector = (item: DataTypeOption) => item.key;
const dataTypeLabelSelector = (item: DataTypeOption) => item.title;

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

interface BiAxialData {
    id: string;
    optionName?: string;
    color: string;
    type: BiAxialChartDataType;
}

interface BiAxialChartItemProps<T> {
    value: BiAxialData;
    onValueChange: (val: (values: BiAxialData[]) => BiAxialData[]) => void;
    index: number;
    options: NumericOption<T>[];
    type: BiAxialChartDataType;
    onToggleChartType: () => void;
}

function BiAxialChartItem<T>(props: BiAxialChartItemProps<T>) {
    const {
        index,
        value,
        onValueChange,
        options,
        onToggleChartType,
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

    return (
        <div className={styles.bar}>
            <SelectInput
                className={styles.select}
                label={`Data #${index + 1} (${value.type})`}
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
            <SegmentInput
                className={styles.dataType}
                label="Type"
                options={dataTypeOptions}
                onChange={onToggleChartType}
                value={value.type}
                optionLabelSelector={dataTypeLabelSelector}
                optionKeySelector={dataTypeKeySelector}
                labelClassName={styles.label}
                segmentClassName={styles.segmentInput}
            />
            <ColorInput
                className={styles.colorSelect}
                label="Color"
                onChange={handleColorChange}
                value={value.color}
                labelClassName={styles.label}
            />
        </div>
    );
}

interface Props<T> {
    onSave: (settings: BiAxialChartSettings<T>) => void;
    className?: string;
    options: NumericOption<T>[];
    keySelector: (item: T) => string;
    editableChartData: BiAxialChartSettings<T> | undefined;
}

function BiAxialChartConfig<T>(props: Props<T>) {
    const {
        onSave,
        className,
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
    const biAxialChartData: BiAxialData[] = useMemo(() => {
        const defaultData: BiAxialData[] = [{
            id: randomString(),
            color: getRandomFromList(tableauColors),
            type: 'line',
        },
        {
            id: randomString(),
            color: getRandomFromList(tableauColors),
            type: 'bar',
        }];

        if (editableChartData) {
            const editableData = editableChartData.chartData;
            if (!editableData) {
                return defaultData;
            }
            const mappedData = editableData.map((e) => {
                const opt = options.find(o => o.key === e.key);
                if (!opt) {
                    return undefined;
                }
                const data: BiAxialData = {
                    color: e.color,
                    id: randomString(),
                    optionName: opt.key,
                    type: e.type as BiAxialChartDataType,
                };

                return data;
            }).filter(isDefined);
            if (mappedData.length <= 0) {
                return defaultData;
            }
            return mappedData;
        }
        return defaultData;
    }, [editableChartData, options]);
    const [biAxialData, setBiAxialData] = useState<BiAxialData[]>(biAxialChartData);
    const [limitValue, setLimitValue] = useState<string>(
        editableChartData ? String(editableChartData.limit?.count) : '7',
    );
    const [order, setOrder] = useState<OrderOptionKey | undefined>('asc');
    const [orderField, setOrderField] = useState<string | undefined>();

    const autoOrderField = isDefined(orderField)
        ? orderField
        : biAxialData[0].optionName;

    const handleSave = useCallback(
        () => {
            if (isFalsyString(title)) {
                setError('Title field is required.');
                return;
            }

            const chartId = randomString();

            const properBars = biAxialData.map((bar) => {
                const option = options.find(item => item.key === bar.optionName);

                if (!option) {
                    return undefined;
                }

                return {
                    title: option.title,
                    valueSelector: option.valueSelector,
                    color: bar.color,
                    dependency: option.dependency,
                    type: bar.type,
                    key: bar.optionName,
                };
            }).filter(isDefined);

            if (properBars.length <= 1) {
                setError('Two bars should be set.');
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
            nonUniqueDependencies.push(orderOption.dependency);

            const dependencies = unique(
                nonUniqueDependencies.filter(isDefined),
                item => item,
            );

            const settings: BiAxialChartSettings<T> = {
                id: chartId,
                type: 'bi-axial-chart',
                title,

                keySelector: primaryKeySelector,

                limit: {
                    count: limit,
                    method: order === 'asc' ? 'min' : 'max',
                    valueSelector: orderOption.valueSelector,
                },

                chartData: properBars,

                dependencies,
            };

            onSave(settings);
        },
        [
            onSave, biAxialData, title, options, limitValue,
            order, autoOrderField, primaryKeySelector,
        ],
    );

    const onToggleChartType = useCallback(() => {
        const toggledChartData: BiAxialData[] = biAxialData.map(item => ({
            ...item,
            type: item.type === 'bar' ? 'line' : 'bar',
        }));
        setBiAxialData(toggledChartData);
    }, [biAxialData, setBiAxialData]);

    return (
        <div className={_cs(className, styles.biAxialChartConfig)}>
            <div className={styles.content}>
                <section className={styles.topSection}>
                    <TextInput
                        label="Title"
                        value={title}
                        onChange={setTitle}
                        autoFocus
                        labelClassName={styles.label}
                    />
                </section>
                <section className={styles.barSection}>
                    <div className={styles.barsHeader}>
                        <h3 className={styles.header}>
                            Data
                        </h3>
                    </div>
                    <div className={styles.bars}>
                        {biAxialData.map((bar, index) => (
                            <BiAxialChartItem
                                key={bar.id}
                                index={index}
                                value={bar}
                                onValueChange={setBiAxialData}
                                options={options}
                                onToggleChartType={onToggleChartType}
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
export default BiAxialChartConfig;
