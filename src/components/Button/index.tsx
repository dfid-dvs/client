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
export interface Props extends Omit<RawButtonProps, 'ref'> {
    variant?: ButtonVariant;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    pending?: boolean;
    transparent?: boolean;
    icons?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, Props>(
    (props, ref) => {
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
                ref={ref}
                className={buttonClassName}
                disabled={pending || disabled}
                onClick={onClick}
                type={type}
                {...otherProps}
            >
                {pending && (
                    <Backdrop className={styles.loadingBackdrop}>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                {icons && (
                    <div className={styles.icons}>
                        { icons }
                    </div>
                )}
                {children && (
                    <div className={styles.children}>
                        { children }
                    </div>
                )}
            </RawButton>

        );
    },
);

export default Button;
