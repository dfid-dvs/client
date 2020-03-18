import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { InputChangeEvent } from '#types';
import styles from './styles.css';

export interface Props extends Omit<React.HTMLProps<HTMLInputElement>, 'onChange'>{
    className?: string;
    onChange: (e: InputChangeEvent) => void;
}

function RawInput(props: Props) {
    const {
        className,
        onChange,
        ...otherProps
    } = props;

    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        const {
            currentTarget: {
                value,
                name,
            },
        } = e;

        onChange({
            value,
            name,
            originalEvent: e,
        });
    };

    return (
        <input
            onChange={handleChange}
            className={_cs(className, styles.rawInput)}
            {...otherProps}
        />
    );
}

export default RawInput;
