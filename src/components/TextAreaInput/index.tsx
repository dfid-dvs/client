import React from 'react';
import { _cs } from '@togglecorp/fujs';

import RawTextAreaInput, { Props as RawTextAreaInputProps } from '../RawTextAreaInput';
import Input, { Props as InputProps } from '../Input';
import styles from './styles.css';

export interface Props<T> extends Omit<RawTextAreaInputProps<T>, 'label' | 'elementRef'>, Omit<InputProps, 'children'> {
    inputClassName?: string;
    textAreaInputRef?: React.RefObject<HTMLTextAreaElement>;
    labelClassName?: string;
}

function TextAreaInput<T>(props: Props<T>) {
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
        textAreaInputRef,
        labelClassName,
        ...otherProps
    } = props;

    return (
        <Input
            className={_cs(styles.textAreaInput, className)}
            elementRef={elementRef}
            label={label}
            icons={icons}
            actions={actions}
            inputContainerClassName={inputContainerClassName}
            iconContainerClassName={iconContainerClassName}
            actionContainerClassName={actionContainerClassName}
            labelClassName={labelClassName}

            disabled={disabled}
            error={error}
        >
            <RawTextAreaInput
                type="text"
                {...otherProps}
                disabled={disabled}
                elementRef={textAreaInputRef}
                className={_cs(styles.input, inputClassName)}
            />
        </Input>
    );
}

export default TextAreaInput;
