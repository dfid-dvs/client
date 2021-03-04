import React from 'react';
import { _cs } from '@togglecorp/fujs';

import RawButton, { Props as RawButtonProps } from '../RawButton';
import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';

import styles from './styles.css';

export type ButtonVariant = (
    'secondary'
    | 'secondary-outline'
    | 'outline'
    | 'transparent'
    | 'icon'
);

const variantToStyleMap: {
    [key in ButtonVariant]: string;
} = {
    secondary: styles.secondary,
    'secondary-outline': styles.secondaryOutline,
    outline: styles.outline,
    transparent: styles.transparent,
    icon: styles.iconOnly,
};

const defaultVariant: ButtonVariant = 'secondary';
export interface ButtonProps extends RawButtonProps {
    variant?: ButtonVariant;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    pending?: boolean;
    transparent?: boolean;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
}

type ButtonFeatureKeys = 'variant' | 'className' | 'transparent' | 'children' | 'icons' | 'actions' | 'disabled' | 'pending';

export function useButtonStyling(props: Pick<ButtonProps, ButtonFeatureKeys>) {
    const {
        variant = defaultVariant,
        className: classNameFromProps,
        disabled,
        transparent = false,
        children,
        icons,
        actions,
        pending,
    } = props;

    const buttonClassName = _cs(
        classNameFromProps,
        styles.button,
        variantToStyleMap[variant],
        transparent && styles.transparent,
    );

    const buttonChildren = (
        <>
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
            {actions && (
                <div className={styles.actions}>
                    { actions }
                </div>
            )}
        </>
    );

    return {
        className: buttonClassName,
        children: buttonChildren,
        disabled: pending || disabled,
    };
}

function Button(props: ButtonProps) {
    const {
        variant = defaultVariant,
        className,
        disabled,
        transparent,
        type,
        pending,
        children,
        icons,
        actions,
        elementRef,
        ...otherProps
    } = props;

    const buttonProps = useButtonStyling({
        variant,
        className,
        transparent,
        disabled,
        children,
        icons,
        actions,
        pending,
    });

    return (
        <RawButton
            elementRef={elementRef}
            type={type}
            {...otherProps}
            {...buttonProps}
        />
    );
}

export default Button;
