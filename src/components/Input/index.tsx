import React from 'react';
import { _cs } from '@togglecorp/fujs';

import RawInput, { Props as RawInputProps } from '../RawInput';
import Label from '../Label';
import styles from './styles.css';

export interface Props<T> extends Omit<RawInputProps<T>, 'elementRef'> {
    className?: string;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    inputRef?: React.RefObject<HTMLInputElement>;
    elementRef?: React.RefObject<HTMLDivElement>;
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
                <Label className={styles.label}>
                    { label }
                </Label>
            )}
            <div className={styles.main}>
                { icons && (
                    <div className={styles.icons}>
                        { icons }
                    </div>
                )}
                <RawInput
                    elementRef={inputRef}
                    className={styles.input}
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
