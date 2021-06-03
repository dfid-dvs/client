import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface LabelProps {
    className?: string;
    children?: React.ReactNode;
}

function Label(props: LabelProps) {
    const {
        className,
        children,
    } = props;

    return (
        <div className={
            _cs(
                className,
                styles.label,
            )}
        >
            { children }
        </div>
    );
}

export default Label;
