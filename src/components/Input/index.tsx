import React from 'react';
import { _cs } from '@togglecorp/fujs';

import RawInput, { Props as RawInputProps } from '../RawInput';
import styles from './styles.css';

export interface Props extends RawInputProps {
    className?: string;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
}

function Input(props: Props) {
    const {
        className,
        label,
        icons,
        actions,
        ...otherProps
    } = props;

    return (
        <div className={_cs(styles.inputContainer, className)}>
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
