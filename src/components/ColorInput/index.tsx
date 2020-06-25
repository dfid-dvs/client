import React from 'react';
import { _cs } from '@togglecorp/fujs';

import RawInput, { Props as RawInputProps } from '../RawInput';
import Input, { Props as InputProps } from '../Input';
import styles from './styles.css';

export interface Props<T> extends Omit<RawInputProps<T>, 'label' | 'elementRef'>, Omit<InputProps, 'children'> {
    inputClassName?: string;
    inputRef?: React.RefObject<HTMLInputElement>;
}

function Color<T>(props: Props<T>) {
    const {
        elementRef,
        className,
        label,
        icons,
        actions,
        inputContainerClassName,
        iconContainerClassName,
        actionContainerClassName,
        disabled,
        error,
        inputClassName,
        inputRef,
        value,
        ...otherProps
    } = props;

    return (
        <Input
            className={_cs(styles.colorInput, className)}
            elementRef={elementRef}
            label={label}
            icons={icons}
            actions={actions}
            inputContainerClassName={inputContainerClassName}
            iconContainerClassName={iconContainerClassName}
            actionContainerClassName={actionContainerClassName}

            error={error}
        >
            <RawInput
                {...otherProps}
                disabled={disabled}
                type="color"
                elementRef={inputRef}
                className={_cs(styles.input, inputClassName)}
                value={value}
                style={{
                    backgroundColor: value as string,
                }}
            />
        </Input>
    );
}

export default Color;
