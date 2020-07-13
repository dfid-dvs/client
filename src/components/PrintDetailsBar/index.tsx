import React from 'react';
import { _cs } from '@togglecorp/fujs';

import infographicLogo from '#resources/infographic-logo.svg';

import styles from './styles.css';

interface Props {
    className?: string;
    title?: string;
    description?: string;
    show: boolean;
}

function PrintDetailsBar(props: Props) {
    const {
        className,
        title,
        description,
        show,
    } = props;

    if (!show) {
        return null;
    }

    return (
        <div className={_cs(styles.printDetailsBar, className)}>
            <div className={styles.leftContainer}>
                <h3 className={styles.heading}>
                    {title}
                </h3>
                <span className={styles.description}>
                    {description}
                </span>
            </div>
            <div className={styles.rightContainer}>
                <img
                    className={styles.logo}
                    src={infographicLogo}
                    alt="DFID"
                />
            </div>
        </div>
    );
}

export default PrintDetailsBar;
