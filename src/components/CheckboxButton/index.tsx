import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    MdCheckBox,
    MdCheckBoxOutlineBlank,
    MdIndeterminateCheckBox,
} from 'react-icons/md';

import RawButton, { Props as RawButtonProps } from '#components/RawButton';

import styles from './styles.css';

export interface Props extends Omit<RawButtonProps, 'ref' | 'value' | 'onChange' | 'onClick'> {
    value?: boolean;
    onChange: (val: boolean) => void;

    // NOTE: if value is false and indeterminate is true, show a filled checkbox
    indeterminate?: boolean;
    labelClassName?: string;
}

const CheckboxButton = React.forwardRef<HTMLButtonElement, Props>(
    (props, ref) => {
        const {
            className,
            children,
            value,
            onChange,
            indeterminate,
            labelClassName,
            disabled,
        } = props;

        const handleClick = React.useCallback(() => {
            if (onChange) {
                onChange(!value);
            }
        }, [value, onChange]);

        return (
            <RawButton
                elementRef={ref}
                className={_cs(
                    className,
                    styles.checkbox,
                    value && styles.checked,
                    indeterminate && styles.indeterminate,
                    disabled && styles.disabled,
                )}
                onClick={handleClick}
                disabled={disabled}
            >
                <div className={styles.icon}>
                    {value && (
                        <MdCheckBox />
                    )}
                    {!value && indeterminate && (
                        <MdIndeterminateCheckBox />
                    )}
                    {!value && !indeterminate && (
                        <MdCheckBoxOutlineBlank />
                    )}
                </div>
                <div className={_cs(styles.label, labelClassName)}>
                    {children}
                </div>
            </RawButton>
        );
    },
);

export default CheckboxButton;
