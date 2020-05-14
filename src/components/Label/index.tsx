import React from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    children?: React.ReactNode;
    className?: string;
}

function Label(props: Props) {
    const {
        className,
        children,
        ...otherProps
    } = props;

    if (!isDefined(children)) {
        return null;
    }

    return (
        <div
            className={_cs(className, styles.label)}
            {...otherProps}
        >
            { children }
        </div>
    );
}

export default Label;
