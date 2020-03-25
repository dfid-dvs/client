import React from 'react';
import { _cs } from '@togglecorp/fujs';

import RawButton, { Props as RawButtonProps } from '../RawButton';

/*
eslint css-modules/no-unused-class: [
    1,
    {
        markAsUsed: [
            'accent',
            'danger',
            'default',
            'primary',
            'success'
            'warning',
        ],
        camelCase: true
    }
]
*/
import styles from './styles.css';

export type ButtonVariant = (
    'accent'
    | 'danger'
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
);

export interface Props extends RawButtonProps {
    variant: ButtonVariant;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    transparent: boolean;
}

function Button(props: Props) {
    const {
        variant,
        className: classNameFromProps,
        disabled,
        transparent,
        type,
        onClick,
        ...otherProps
    } = props;

    const buttonClassName = _cs(
        classNameFromProps,
        'button',
        styles.button,
        variant,
        styles[variant],
        transparent && 'transparent',
        transparent && styles.transparent,
    );

    // TODO:
    // 1. implement pending state
    // 2. implement icon support
    // 3. implement small, medium, big sizes
    // 4. implement outline button

    return (
        // eslint-disable-next-line react/button-has-type
        <RawButton
            className={buttonClassName}
            disabled={disabled || !onClick}
            onClick={onClick}
            type={type}
            {...otherProps}
        />
    );
}

const defaultVariant: ButtonVariant = 'default';
Button.defaultProps = {
    variant: defaultVariant,
    disabled: false,
    pending: false,
    transparent: false,
};

export default Button;
