import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props<T> extends Omit<React.HTMLProps<HTMLInputElement>, 'onChange' | 'onBlur'>{
    className?: string;
    onChange: (value: string, name: string, e: React.FormEvent<HTMLInputElement>) => void;
    onBlur?: (name: string, e: React.FormEvent<HTMLInputElement>) => void;
    elementRef?: React.RefObject<HTMLInputElement>;
}

function RawInput<T=string>(props: Props<T>) {
    const {
        className,
        onChange,
        onBlur,
        elementRef,
        ...otherProps
    } = props;

    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        const {
            currentTarget: {
                value,
                name,
            },
        } = e;

        onChange(
            value,
            name,
            e,
        );
    };

    const handleBlur = (e: React.FormEvent<HTMLInputElement>) => {
        const {
            currentTarget: {
                name,
            },
        } = e;

        if (onBlur) {
            onBlur(
                name,
                e,
            );
        }
    };
    return (
        <input
            ref={elementRef}
            onChange={handleChange}
            onBlur={onBlur ? handleBlur : undefined}
            className={_cs(className, styles.rawInput)}
            {...otherProps}
        />
    );
}
RawInput.defaultProps = {
    value: '',
};

export default RawInput;
