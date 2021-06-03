import React, {
    useCallback,
    useMemo,
} from 'react';
import { IoMdClose } from 'react-icons/io';
import { _cs, isNotDefined } from '@togglecorp/fujs';

import { OptionKey } from '../types';

import Button from '#components/Button';
import HintAndError from '#components/HintAndError';
import InputLabel from '#components/InputLabel';
import { generateExtendedRelations } from './utils';
import TreeNodeList from './TreeNodeList';
import styles from './styles.css';

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
    showClearButton: boolean;
    title?: string;
    value: K[];

    defaultCollapseLevel: number;

    sync?: boolean;
    enabledOptions?: number[] | string[];
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
        showClearButton,
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
        enabledOptions,
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
            <div className={styles.labelContainer}>
                {showLabel && (
                    <InputLabel
                        className={_cs(styles.label, labelClassName)}
                        disabled={disabled}
                        error={!!error}
                        // title={label}
                        // rightComponent={labelRightComponent}
                        // rightComponentClassName={labelRightComponentClassName}
                    >
                        {label}
                    </InputLabel>
                )}
                {showClearButton && (
                    <Button
                        onClick={handleClear}
                        className={styles.button}
                        transparent
                        title="Clear all"
                        disabled={!value || value.length <= 0}
                    >
                        <IoMdClose />
                    </Button>
                )}
            </div>
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
                enabledOptions={enabledOptions}
                sync={sync}
            />
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
    showHintAndError: false,
    showLabel: true,
    showClearButton: true,
    value: [],
    options: [],
    defaultCollapseLevel: 1,
};

export default TreeInput;
