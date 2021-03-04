import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface SubtitleProps {
    className?: string;
    children?: React.ReactNode;
}

function Subtitle(props: SubtitleProps) {
    const {
        className,
        children,
    } = props;

    return (
        <div className={
            _cs(
                className,
                styles.subtitle,
            )}
        >
            { children }
        </div>
    );
}

export default Subtitle;
