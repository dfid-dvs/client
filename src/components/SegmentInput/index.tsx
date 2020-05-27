import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Label from '#components/Label';

import Option from './Option';
import styles from './styles.css';

interface Props<T, V> {
    className?: string;
    options?: T[];
    optionKeySelector: (d: T) => V;
    optionLabelSelector: (d: T) => string;
    renderer?: typeof Option;
    // renderer?: React.ReactNode;
    label?: React.ReactNode;
    value?: V;
    onChange?: (value: V, name: string | undefined) => void;
    name?: string;
    disabled?: boolean;
    hideLabel?: boolean;
    error?: string;
}


function SegmentInput<T, V extends string | number>(props: Props<T, V>) {
    const {
        className,
        options = [],
        optionKeySelector,
        optionLabelSelector,
        renderer,
        label,
        value,
        hideLabel,
        onChange,
        name,
        disabled,
        error,
    } = props;

    return (
        <div className={_cs(className, styles.segmentInput)}>
            {!hideLabel && (
                <Label
                    disabled={disabled}
                    error={!!error}
                >
                    {label}
                </Label>
            )}
            <div className={styles.inputContainer}>
                { options.map((option) => {
                    const key = optionKeySelector(option);
                    const isActive = key === value;

                    const RenderOption = renderer || Option;

                    const optionLabel = optionLabelSelector
                        ? optionLabelSelector(option)
                        : undefined;

                    return (
                        <RenderOption
                            key={key}
                            onClick={onChange ? (() => onChange(key, name)) : undefined}
                            isActive={isActive}
                            label={optionLabel}
                            disabled={disabled}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default SegmentInput;
