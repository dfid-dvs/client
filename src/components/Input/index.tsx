import React from 'react';
import { _cs } from '@togglecorp/fujs';

import InputLabel from '#components/InputLabel';
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
    labelClassName?: string;
    children?: React.ReactNode;

    label?: React.ReactNode;
    disabled?: boolean;
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
        labelClassName,
        disabled,
        error,
        children,
    } = props;

    return (
        <div
            ref={elementRef}
            className={_cs(styles.inputContainer, className)}
        >
            {label && (
                <InputLabel
                    className={_cs(styles.label, labelClassName)}
                    disabled={disabled}
                    error={!!error}
                >
                    { label }
                </InputLabel>
            )}
            <div
                className={_cs(styles.main, inputContainerClassName, disabled && styles.disabled)}
            >
                {icons && (
                    <div className={_cs(iconContainerClassName, styles.icons)}>
                        { icons }
                    </div>
                )}
                {children}
                { actions && (
                    <div className={_cs(actionContainerClassName, styles.actions)}>
                        { actions }
                    </div>
                )}
            </div>
        </div>
    );
}

export default Input;
