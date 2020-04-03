import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { MdCheckBoxOutlineBlank, MdCheckBox } from 'react-icons/md';

import RawButton from '#components/RawButton';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Checkbox(props: Props) {
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
    }, [value, onChange]);

    return (
        <RawButton
            className={_cs(
                className,
                styles.checkbox,
                value && styles.checked,
            )}
            onClick={handleClick}
        >
            <div className={styles.icon}>
                { value ? <MdCheckBox /> : <MdCheckBoxOutlineBlank /> }
            </div>
            <div className={styles.label}>
                { label }
            </div>
        </RawButton>
    );
}

export default Checkbox;
