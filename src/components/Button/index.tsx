import React from 'react';
import { _cs } from '@togglecorp/fujs';

import RawButton, { Props as RawButtonProps } from '../RawButton';
import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';

import styles from './styles.css';

export type ButtonVariant = (
    'accent'
    | 'danger'
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
);

const defaultVariant: ButtonVariant = 'default';
// TODO:
// 1. implement small, medium, big sizes
// 2. implement outline button
export interface Props extends RawButtonProps {
    variant?: ButtonVariant;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    pending?: boolean;
    transparent: boolean;
    icons?: React.ReactNode;
}

function Button(props: Props) {
    const {
        variant = defaultVariant,
        className: classNameFromProps,
        disabled,
        transparent,
        type,
        onClick,
        pending,
        children,
        icons,
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

    return (
        <RawButton
            className={buttonClassName}
            disabled={pending || disabled || !onClick}
            onClick={onClick}
            type={type}
            {...otherProps}
        >
            { pending && (
                <Backdrop className={styles.loadingBackdrop}>
                    <LoadingAnimation />
                </Backdrop>
            )}
            { icons && (
                <div className={styles.icons}>
                    { icons }
                </div>
            )}
            { children && (
                <div className={styles.children}>
                    { children }
                </div>
            )}
        </RawButton>

    );
}

Button.defaultProps = {
    // variant: defaultVariant,
    disabled: false,
    pending: false,
    transparent: false,
};

export default Button;
