import React from 'react';
import { _cs } from '@togglecorp/fujs';

import RawInput, { Props as RawInputProps } from '../RawInput';
import Label from '../Label';
import styles from './styles.css';

export interface Props<T> extends Omit<RawInputProps<T>, 'elementRef'> {
    className?: string;
    inputContainerClassName?: string;
    inputClassName?: string;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    inputRef?: React.RefObject<HTMLInputElement>;
    elementRef?: React.RefObject<HTMLDivElement>;
    error?: string;
    iconContainerClassName?: string;
    actionContainerClassName?: string;
}

function Input<T>(props: Props<T>) {
    const {
        elementRef,
        className,
        label,
        icons,
        actions,
        inputRef,
        inputContainerClassName,
        iconContainerClassName,
        actionContainerClassName,
        inputClassName,
        disabled,
        error,
        ...otherProps
    } = props;

    return (
        <div
            ref={elementRef}
            className={_cs(styles.inputContainer, className)}
        >
            { label && (
                <Label
                    className={styles.label}
                    disabled={disabled}
                    error={!!error}
                >
                    { label }
                </Label>
            )}
            <div
                className={_cs(styles.main, inputContainerClassName, disabled && styles.disabled)}
            >
                { icons && (
                    <div className={_cs(iconContainerClassName, styles.icons)}>
                        { icons }
                    </div>
                )}
                <RawInput
                    elementRef={inputRef}
                    className={_cs(styles.input, inputClassName)}
                    disabled={disabled}
                    {...otherProps}
                />
                { actions && (
                    <div className={_cs(actionContainerClassName, styles.actions)}>
                        { actions }
                    </div>
                )}
            </div>
            {/*
            <div className={styles.extra}>
                extra
            </div>
            */}
        </div>
    );
}

export default Input;
