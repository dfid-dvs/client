import React from 'react';
import { _cs } from '@togglecorp/fujs';

import RawInput, { Props as RawInputProps } from '../RawInput';
import styles from './styles.css';

export interface Props<T> extends RawInputProps<T> {
    className?: string;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    inputRef?: React.RefObject<HTMLInputElement>;
}

function Input<T>(props: Props<T>) {
    const {
        elementRef,
        className,
        label,
        icons,
        actions,
        inputRef,
        ...otherProps
    } = props;

    return (
        <div
            ref={elementRef}
            className={_cs(styles.inputContainer, className)}
        >
            { label && (
                <div className={styles.label}>
                    { label }
                </div>
            )}
            <div className={styles.main}>
                { icons && (
                    <div className={styles.icons}>
                        { icons }
                    </div>
                )}
                <RawInput
                    elementRef={inputRef}
                    className={_cs(styles.input, className)}
                    {...otherProps}
                />
                { actions && (
                    <div className={styles.actions}>
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
