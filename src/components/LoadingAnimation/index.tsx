import React, { memo } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props {
    className?: string;
}

function LoadingAnimation(props: Props) {
    const { className } = props;

    return (
        <div className={_cs(className, styles.loadingAnimation)}>
            <div className={styles.circle} />
            <div className={styles.circle} />
            <div className={styles.circle} />
        </div>
    );
}

export default memo(LoadingAnimation);
