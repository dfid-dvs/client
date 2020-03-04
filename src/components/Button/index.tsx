import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

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

type ButtonType = 'button' | 'submit' | 'reset';

export interface Props extends Omit<React.HTMLProps<HTMLButtonElement>, 'onClick' | 'ref'> {
    variant: ButtonVariant;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick?: (event: React.MouseEvent) => void;
    transparent: boolean;
    type?: ButtonType;
}

function Button(props: Props) {
    const {
        variant,
        children,
        className: classNameFromProps,
        disabled,
        transparent,
        type,
        onClick,
        ...otherProps
    } = props;

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (onClick) {
                onClick(e);
            }
        },
        [onClick],
    );

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
        <button
            className={buttonClassName}
            disabled={disabled || !onClick}
            onClick={handleClick}
            type={type}
            {...otherProps}
        >
            { children }
        </button>
    );
}

const defaultVariant: ButtonVariant = 'default';
const defaultType: ButtonType = 'button';
Button.defaultProps = {
    variant: defaultVariant,
    disabled: false,
    pending: false,
    transparent: false,
    type: defaultType,
};

export default Button;
