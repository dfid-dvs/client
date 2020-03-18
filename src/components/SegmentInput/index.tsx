import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props<T = {}> {
    className?: string;
    options?: T[];
    optionKeySelector?: (d: T) => string;
    optionLabelSelector?: (d: T) => string;
    renderer?: React.ReactNode;
    label?: React.ReactNode;
    value?: T;
    onChange?: (key: string | undefined) => void;
}

interface OptionProps {
    onClick?: () => void;
    label?: string;
    isActive?: boolean;
    className?: string;
    disabled?: boolean;
}

const Option = ({
    onClick,
    label,
    isActive,
    className,
    disabled,
}: OptionProps) => (
    <div
        role="presentation"
        onClick={disabled ? undefined : onClick}
        className={_cs(
            className,
            styles.option,
            isActive && styles.active,
            disabled && styles.disabled,
        )}
    >
        { label }
    </div>
);

const SegmentInput = (props: Props) => {
    const {
        className,
        options = [],
        optionKeySelector,
        optionLabelSelector,
        renderer,
        label,
        value,
        onChange,
    } = props;

    return (
        <div className={_cs(className, styles.switch)}>
            <div className={styles.inputLabel}>
                { label }
            </div>
            <div className={styles.inputContainer}>
                { options.map((option) => {
                    const key = optionKeySelector ? optionKeySelector(option) : undefined;
                    const isActive = key === value;
                    let RenderOption = Option;

                    if (renderer) {
                        RenderOption = renderer;
                    }

                    const optionLabel = optionLabelSelector
                        ? optionLabelSelector(option)
                        : undefined;

                    return (
                        <RenderOption
                            key={key}
                            onClick={onChange ? (() => onChange(key)) : undefined}
                            isActive={isActive}
                            label={optionLabel}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default SegmentInput;
