import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { InputChangeEvent } from '#types';
import styles from './styles.css';

interface Props {
    className?: string;
    onChange: (e: InputChangeEvent) => void;
}

const Input = (props: Props) => {
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
            className={_cs(className, styles.input)}
            {...otherProps}
        />
    );
};

export default Input;
