import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    MdCheckBox,
    MdCheckBoxOutlineBlank,
    MdIndeterminateCheckBox,
} from 'react-icons/md';

import RawButton, { Props as RawButtonProps } from '#components/RawButton';

import styles from './styles.css';

export interface Props extends Omit<RawButtonProps, 'value' | 'onChange' | 'onClick'> {
    value?: boolean;
    onChange: (val: boolean) => void;

    // NOTE: if value is false and indeterminate is true, show a filled checkbox
    indeterminate?: boolean;
}

function CheckboxButton(props: Props) {
    const {
        className,
        children,
        value,
        onChange,
        indeterminate,
    } = props;

    const handleClick = React.useCallback(() => {
        if (onChange) {
            onChange(!value);
        }
    }, [value, onChange]);

    return (
        <RawButton
            className={_cs(
                className,
                styles.checkbox,
                value && styles.checked,
                indeterminate && styles.indeterminate,
            )}
            onClick={handleClick}
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
            <div className={styles.label}>
                {children}
            </div>
        </RawButton>
    );
}

export default CheckboxButton;
