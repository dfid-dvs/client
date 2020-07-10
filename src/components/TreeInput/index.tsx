import React, {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { IoMdArrowDropright } from 'react-icons/io';
import { _cs, isNotDefined, Obj } from '@togglecorp/fujs';

import { OptionKey } from '../types';

import Button from '#components/Button';
import List from '#components/List';
import CheckboxButton from '#components/CheckboxButton';
import HintAndError from '#components/HintAndError';
import Label from '#components/Label';
import { generateExtendedRelations, ExtendedRelation } from './utils';

import styles from './styles.css';

interface TreeNodeProps<T, K extends OptionKey> {
    className?: string;
    keySelector: (datum: T) => K;
    parentKeySelector: (datum: T) => K | undefined;
    labelSelector: (datum: T) => string | number;
    onChange: (keys: K[]) => void;
    value: K[];
    nodeKey: K;
    nodeLabel: string | number;

    disabled: boolean;
    readOnly: boolean;
    defaultCollapseLevel: number;
    level: number;

    relations: Obj<ExtendedRelation<T, K> | undefined>;

    sync: boolean;
}

function TreeNode<T, K extends OptionKey>(props: TreeNodeProps<T, K>) {
    const {
        className,
        disabled,
        readOnly,
        nodeKey,
        nodeLabel,

        value,
        labelSelector,
        parentKeySelector,
        keySelector,
        level,
        defaultCollapseLevel,
        onChange,
        relations,

        sync,
    } = props;

    const [collapsed, setCollapsed] = useState(level >= defaultCollapseLevel);

    const relation = relations[nodeKey];
    const allOwnOptions = relation ? relation.children : undefined;

    const ownOptions = useMemo(
        () => allOwnOptions && allOwnOptions.filter(
            option => parentKeySelector(option) === nodeKey,
        ),
        [allOwnOptions, parentKeySelector, nodeKey],
    );

    const isLeaf = ownOptions && ownOptions.length <= 0;

    const someSelected = useMemo(
        () => ownOptions && ownOptions.some((option) => {
            const key = keySelector(option);
            // FIXME: create a mapping to optimize check
            const selected = value.includes(key);
            return selected;
        }),
        [value, keySelector, ownOptions],
    );

    // FIXME: create a mapping to optimize check
    const checked = value.includes(nodeKey);

    const handleCollapseOption = useCallback(
        () => {
            setCollapsed(true);
        },
        [],
    );
    const handleToggleCollapseOption = useCallback(
        () => {
            setCollapsed(v => !v);
        },
        [],
    );
    const handleCheckboxChange = useCallback(
        (val: boolean) => {
            const oldKeys = new Set(value);

            if (!sync) {
                if (val) {
                    oldKeys.add(nodeKey);
                } else {
                    oldKeys.delete(nodeKey);
                }
                onChange([...oldKeys]);
                return;
            }

            if (val) {
                // NOTE: Add current node
                oldKeys.add(nodeKey);
                if (allOwnOptions) {
                    // NOTE: Add all children nodes
                    allOwnOptions.forEach((option) => {
                        oldKeys.add(keySelector(option));
                    });
                }
            } else {
                // NOTE: Remove current node
                oldKeys.delete(nodeKey);
                // NOTE: Remove all children nodes
                if (allOwnOptions) {
                    allOwnOptions.forEach((option) => {
                        oldKeys.delete(keySelector(option));
                    });
                }
            }
            onChange([...oldKeys]);
        },
        [onChange, value, nodeKey, keySelector, allOwnOptions, sync],
    );

    const handleTreeNodeChange = useCallback(
        (newKeys: K[]) => {
            if (!sync) {
                onChange(newKeys);
                return;
            }

            // if all child keys are selected, then select current as well
            const allChildSelected = ownOptions && ownOptions.every((item) => {
                const itemKey = keySelector(item);
                // FIXME: create a mapping to optimize check
                const selected = newKeys.includes(itemKey);
                return selected;
            });

            if (allChildSelected) {
                onChange([...newKeys, nodeKey]);
            // FIXME: create a mapping to optimize check
            } else if (newKeys.includes(nodeKey)) {
                // if not all child selected && current key is there
                const filteredKeys = newKeys.filter(key => key !== nodeKey);
                onChange(filteredKeys);
            } else {
                onChange(newKeys);
            }
        },
        [onChange, keySelector, ownOptions, nodeKey, sync],
    );

    return (
        <div className={_cs(styles.treeNode, className, collapsed && styles.collapsed)}>
            <div className={styles.left}>
                <Button
                    className={styles.expandButton}
                    disabled={isLeaf}
                    onClick={handleToggleCollapseOption}
                    transparent
                >
                    <IoMdArrowDropright />
                </Button>
                {!collapsed && !isLeaf && (
                    <div
                        className={styles.stem}
                        role="button"
                        onClick={handleCollapseOption}
                        onKeyDown={handleCollapseOption}
                        tabIndex={-1}
                    >
                        <div className={styles.line} />
                    </div>
                )}
            </div>
            <div className={styles.right}>
                <CheckboxButton
                    className={styles.checkbox}
                    value={checked}
                    disabled={disabled}
                    readOnly={readOnly}
                    onChange={handleCheckboxChange}
                    // FIXME: not need to calculate someSelected if not sync mode
                    indeterminate={sync && someSelected}
                >
                    {nodeLabel}
                </CheckboxButton>
                { !isLeaf && (
                    <TreeNodeList
                        relations={relations}
                        className={styles.nodeList}
                        visibleOptions={ownOptions}
                        keySelector={keySelector}
                        disabled={disabled}
                        readOnly={readOnly}
                        labelSelector={labelSelector}
                        parentKeySelector={parentKeySelector}
                        value={value}
                        defaultCollapseLevel={defaultCollapseLevel}
                        level={level + 1}
                        onChange={handleTreeNodeChange}
                        sync={sync}
                    />
                )}
            </div>
        </div>
    );
}

interface TreeNodeListProps<T, K extends OptionKey> {
    className?: string;
    keySelector: (datum: T) => K;
    parentKeySelector: (datum: T) => K | undefined;
    labelSelector: (datum: T) => string | number;

    onChange: (keys: K[]) => void;
    value: K[];

    visibleOptions: T[];

    disabled: boolean;
    readOnly: boolean;

    defaultCollapseLevel: number;
    level: number;

    relations: Obj<ExtendedRelation<T, K> | undefined>;

    sync: boolean;
}
function TreeNodeList<T, K extends OptionKey>(props: TreeNodeListProps<T, K>) {
    const {
        className,
        // options,
        keySelector,
        disabled,
        readOnly,
        labelSelector,
        parentKeySelector,
        value,
        onChange,

        // childOptions,
        visibleOptions,

        level,
        defaultCollapseLevel,
        relations,

        sync,
    } = props;

    const rendererParams = useCallback(
        (key: K, v: T) => ({
            disabled,
            readOnly,

            nodeLabel: labelSelector(v),
            nodeKey: key,

            // For children
            keySelector,
            labelSelector,
            parentKeySelector,
            value,
            defaultCollapseLevel,
            level,
            onChange,
            relations,

            sync,
        }),
        [
            value, onChange, relations,
            readOnly, disabled,
            defaultCollapseLevel, level,
            keySelector, labelSelector, parentKeySelector,
            sync,
        ],
    );

    return (
        <div className={_cs(styles.treeNodeList, className)}>
            <List
                keySelector={keySelector}
                data={visibleOptions}
                renderer={TreeNode}
                rendererParams={rendererParams}
            />
        </div>
    );
}
TreeNodeList.defaultProps = {
    visibleOptions: [],
};

export interface TreeProps<T, K extends OptionKey> {
    // autoFocus?: boolean;
    className?: string;
    disabled: boolean;
    error?: string;
    hint?: string;
    keySelector: (datum: T) => K;
    parentKeySelector: (datum: T) => K | undefined;
    label?: string;
    labelClassName?: string;
    labelSelector: (datum: T) => string | number;
    onChange: (keys: K[]) => void;
    options: T[];
    readOnly: boolean;
    showHintAndError: boolean;
    showLabel: boolean;
    title?: string;
    value: K[];

    defaultCollapseLevel: number;

    sync?: boolean;
    // labelRightComponent?: React.ReactNode;
    // labelRightComponentClassName?: string;
}

function TreeInput<T, K extends OptionKey = string>(props: TreeProps<T, K>) {
    const {
        className: classNameFromProps,
        disabled,
        error,
        hint,
        label,
        labelClassName,
        // labelRightComponent,
        // labelRightComponentClassName,
        showHintAndError,
        showLabel,
        title,
        keySelector,
        parentKeySelector,
        labelSelector,
        onChange,
        options,
        readOnly,
        value,
        defaultCollapseLevel,

        sync = false,
    } = props;

    const className = _cs(
        classNameFromProps,
        'tree',
        styles.tree,
        disabled && styles.disabled,
        disabled && 'disabled',
        error && styles.error,
        error && 'error',
    );

    const visibleOptions = useMemo(
        () => options.filter((option) => {
            const parentKey = parentKeySelector(option);
            return isNotDefined(parentKey);
        }),
        [options, parentKeySelector],
    );

    const relations = useMemo(
        () => generateExtendedRelations(
            options,
            keySelector,
            parentKeySelector,
        ),
        [options, keySelector, parentKeySelector],
    );

    const handleClear = useCallback(
        () => {
            onChange([]);
        },
        [onChange],
    );

    return (
        <div
            className={_cs(styles.treeInput, className)}
            title={title}
        >
            {showLabel && (
                <Label
                    className={labelClassName}
                    disabled={disabled}
                    error={!!error}
                    // title={label}
                    // rightComponent={labelRightComponent}
                    // rightComponentClassName={labelRightComponentClassName}
                >
                    {label}
                </Label>
            )}
            <TreeNodeList
                className={styles.nodeList}
                defaultCollapseLevel={defaultCollapseLevel}
                level={0}

                readOnly={readOnly}
                disabled={disabled}

                keySelector={keySelector}
                parentKeySelector={parentKeySelector}
                labelSelector={labelSelector}
                value={value}
                relations={relations}

                onChange={onChange}
                visibleOptions={visibleOptions}

                sync={sync}
            />
            <Button
                onClick={handleClear}
                transparent
                disabled={!value || value.length <= 0}
            >
                Clear
            </Button>
            {showHintAndError && (
                <HintAndError
                    error={error}
                    hint={hint}
                />
            )}
        </div>
    );
}
TreeInput.defaultProps = {
    disabled: false,
    readOnly: false,
    showHintAndError: true,
    showLabel: true,
    value: [],
    options: [],
    defaultCollapseLevel: 1,
};

export default TreeInput;
