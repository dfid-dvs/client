import React, { useCallback } from 'react';
import { _cs, Obj } from '@togglecorp/fujs';
import List from '#components/List';

import styles from './styles.css';
import { OptionKey } from '../../types';
import TreeNode from '../TreeNode';
import { ExtendedRelation } from '../utils';

interface TreeNodeListProps<T, K extends OptionKey> {
    className?: string;
    keySelector: (datum: T) => K;
    parentKeySelector: (datum: T) => K | undefined;
    labelSelector: (datum: T) => string | number;

    onChange: (keys: K[]) => void;
    value: K[];

    visibleOptions: T[];
    enabledOptions?: number[] | string[];
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
        enabledOptions,
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
                enabledOptions={enabledOptions}
            />
        </div>
    );
}

TreeNodeList.defaultProps = {
    visibleOptions: [],
};

export default TreeNodeList;
