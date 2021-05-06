import React from 'react';
import { _cs } from '@togglecorp/fujs';

import RawButton from '#components/RawButton';

import styles from './styles.css';

function ToggleSwitch(props: { className?: string; value?: boolean; disabled?: boolean }) {
    const {
        className,
        value,
        disabled,
    } = props;

    return (
        <div className={_cs(
            styles.switch,
            className,
            value ? styles.on : styles.off,
            disabled && styles.disabled,
        )}
        >
            <div className={styles.knob} />
        </div>
    );
}

interface Props {
    className?: string;
    label?: React.ReactNode;
    onChange?: (v: boolean) => void;
    value: boolean;
    disabled?: boolean;
}

function ToggleButton(props: Props) {
    const {
        className,
        label,
        value,
        onChange,
        disabled,
    } = props;

    const handleClick = React.useCallback(
        () => {
            if (onChange) {
                onChange(!value);
            }
        },
        [onChange, value],
    );

    return (
        <RawButton
            className={_cs(styles.toggleButton, className)}
            onClick={handleClick}
            disabled={disabled}
        >
            <ToggleSwitch
                value={value}
                disabled={disabled}
                className={styles.switch}
            />
            <div className={styles.label}>
                { label }
            </div>
        </RawButton>
    );
}

export default ToggleButton;
