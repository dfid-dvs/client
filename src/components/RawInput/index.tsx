import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props<T> extends Omit<React.HTMLProps<HTMLInputElement>, 'onChange'>{
    className?: string;
    onChange: (value: string, name: string, e: React.FormEvent<HTMLInputElement>) => void;
    elementRef?: React.RefObject<HTMLInputElement>;
}

function RawInput<T=string>(props: Props<T>) {
    const {
        className,
        onChange,
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

    return (
        <input
            ref={elementRef}
            onChange={handleChange}
            className={_cs(className, styles.rawInput)}
            {...otherProps}
        />
    );
}

export default RawInput;
