import React from 'react';
import { _cs } from '@togglecorp/fujs';

import RawInput, { Props as RawInputProps } from '../RawInput';
import Input, { Props as InputProps } from '../Input';
import styles from './styles.css';

export interface Props<T> extends Omit<RawInputProps<T>, 'label' | 'elementRef'>, Omit<InputProps, 'children'> {
    inputClassName?: string;
    inputRef?: React.RefObject<HTMLInputElement>;
    labelClassName?: string;
}

function NumberInput<T>(props: Props<T>) {
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
        inputClassName,
        inputRef,
        ...otherProps
    } = props;

    return (
        <Input
            className={_cs(styles.numberInput, className)}
            elementRef={elementRef}
            label={label}
            icons={icons}
            actions={actions}
            inputContainerClassName={inputContainerClassName}
            iconContainerClassName={iconContainerClassName}
            actionContainerClassName={actionContainerClassName}

            error={error}
            labelClassName={labelClassName}
        >
            <RawInput
                {...otherProps}
                disabled={disabled}
                type="number"
                elementRef={inputRef}
                className={_cs(styles.input, inputClassName)}
            />
        </Input>
    );
}

export default NumberInput;
