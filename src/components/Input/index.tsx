import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Label from '../Label';
import styles from './styles.css';

export interface Props {
    className?: string;
    inputContainerClassName?: string;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    elementRef?: React.RefObject<HTMLDivElement>;
    error?: string;
    iconContainerClassName?: string;
    actionContainerClassName?: string;
    children?: React.ReactNode;

    label?: React.ReactNode;
    disabled?: boolean;
    // inputClassName?: string;
    // inputRef?: React.RefObject<HTMLInputElement>;
}

function Input(props: Props) {
    const {
        elementRef,
        className,
        label,
        icons,
        actions,
        inputContainerClassName,
        iconContainerClassName,
        actionContainerClassName,
        disabled,
        error,
        children,
        // inputRef,
        // inputClassName,
        // ...otherProps
    } = props;

    return (
        <div
            ref={elementRef}
            className={_cs(styles.inputContainer, className)}
        >
            {label && (
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
                {children}
                {/*
                <RawInput
                    elementRef={inputRef}
                    className={_cs(styles.input, inputClassName)}
                    disabled={disabled}
                    {...otherProps}
                />
                */}
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
