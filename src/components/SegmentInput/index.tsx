import React from 'react';
import { _cs } from '@togglecorp/fujs';

import InputLabel from '#components/InputLabel';

import Option from './Option';
import styles from './styles.css';

interface Props<T, V> {
    className?: string;
    options?: T[];
    optionKeySelector: (d: T) => V;
    optionLabelSelector: (d: T) => React.ReactNode;
    optionTitleSelector?: (d: T) => string | undefined;
    renderer?: typeof Option;
    // renderer?: React.ReactNode;
    label?: React.ReactNode;
    value?: V;
    onChange?: (value: V, name: string | undefined) => void;
    name?: string;
    disabled?: boolean;
    hideLabel?: boolean;
    error?: string;
    labelClassName?: string;
    segmentClassName?: string;
}


function SegmentInput<T, V extends string | number>(props: Props<T, V>) {
    const {
        className,
        options = [],
        optionKeySelector,
        optionLabelSelector,
        optionTitleSelector,
        renderer,
        label,
        value,
        hideLabel,
        onChange,
        name,
        disabled,
        error,
        labelClassName,
        segmentClassName,
    } = props;

    return (
        <div className={_cs(className, styles.segmentInput)}>
            {!hideLabel && label && (
                <InputLabel
                    disabled={disabled}
                    error={!!error}
                    className={_cs(styles.inputLabel, labelClassName)}
                >
                    {label}
                </InputLabel>
            )}
            <div className={_cs(styles.inputContainer, segmentClassName)}>
                { options.map((option) => {
                    const key = optionKeySelector(option);
                    const isActive = key === value;

                    const RenderOption = renderer || Option;

                    const optionLabel = optionLabelSelector
                        ? optionLabelSelector(option)
                        : undefined;

                    const optionTitle = optionTitleSelector
                        ? optionTitleSelector(option)
                        : undefined;

                    return (
                        <RenderOption
                            key={key}
                            // FIXME: pass name inside render option
                            onClick={onChange ? (() => onChange(key, name)) : undefined}
                            isActive={isActive}
                            label={optionLabel}
                            title={optionTitle}
                            disabled={disabled}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default SegmentInput;
