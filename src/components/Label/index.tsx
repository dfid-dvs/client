import React from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    error?: boolean;
}

function Label(props: Props) {
    const {
        className,
        children,
        disabled,
        error,
        ...otherProps
    } = props;

    if (!isDefined(children)) {
        return null;
    }

    return (
        <div
            className={_cs(
                className,
                styles.label,
                disabled && styles.disabled,
                error && styles.error,
            )}
            {...otherProps}
        >
            { children }
        </div>
    );
}

export default Label;
