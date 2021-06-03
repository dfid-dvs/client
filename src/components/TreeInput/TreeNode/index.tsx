import React, {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { IoMdArrowDropright } from 'react-icons/io';
import { _cs, Obj } from '@togglecorp/fujs';

import { OptionKey } from '../../types';

import RawButton from '#components/RawButton';
import CheckboxButton from '#components/CheckboxButton';

import styles from './styles.css';
import { ExtendedRelation } from '../utils';
import TreeNodeList from '../TreeNodeList';

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

export default function TreeNode<T, K extends OptionKey>(props: TreeNodeProps<T, K>) {
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
                <RawButton
                    className={styles.expandButton}
                    disabled={isLeaf}
                    onClick={handleToggleCollapseOption}
                >
                    <IoMdArrowDropright />
                </RawButton>
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
