import React from 'react';
import { _cs } from '@togglecorp/fujs';

import RawButton from '#components/RawButton';

import styles from './styles.css';

interface Props {
    className?: string;
    label?: React.ReactNode;
    onChange?: (v: boolean) => void;
    value: boolean;
}

function ToggleSwitch(props) {
    const {
        className,
        value,
    } = props;

    return (
        <div className={_cs(
            styles.switch,
            className,
            value ? styles.on : styles.off,
        )}
        >
            <div className={styles.knob} />
        </div>
    );
}

function ToggleButton(props: Props) {
    const {
        className,
        label,
        value,
        onChange,
    } = props;

    const handleClick = React.useCallback(() => {
        if (onChange) {
            onChange(!value);
        }
    }, [onChange, value]);

    return (
        <RawButton
            className={_cs(styles.toggleButton, className)}
            onClick={handleClick}
        >
            <ToggleSwitch
                value={value}
            />
            <div className={styles.label}>
                { label }
            </div>
        </RawButton>
    );
}

export default ToggleButton;
