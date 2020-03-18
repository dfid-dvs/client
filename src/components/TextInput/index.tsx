import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Input, { Props as InputProps } from '../Input';
import styles from './styles.css';

export interface Props extends InputProps {
    className?: string;
}

function TextInput(props: Props) {
    const {
        className,
        ...otherProps
    } = props;

    return (
        <Input
            type="text"
            className={_cs(styles.textInput, className)}
            {...otherProps}
        />
    );
}

export default TextInput;
