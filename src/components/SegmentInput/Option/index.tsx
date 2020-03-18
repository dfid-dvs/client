import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props {
    onClick?: () => void;
    label?: string;
    isActive?: boolean;
    className?: string;
    disabled?: boolean;
}

const Option = ({
    onClick,
    label,
    isActive,
    className,
    disabled,
}: Props) => (
    <div
        role="presentation"
        onClick={disabled ? undefined : onClick}
        className={_cs(
            className,
            styles.option,
            isActive && styles.active,
            disabled && styles.disabled,
        )}
    >
        { label }
    </div>
);

export default Option;
