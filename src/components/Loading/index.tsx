import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Spinner from '#rscv/Spinner';

import styles from './styles.scss';

interface Props {
    pending: boolean;
    text: string;
    className: string;
}

const Loading = ({
    pending,
    text,
    className,
}: Props) => {
    if (!pending) {
        return null;
    }

    return (
        <div className={_cs(styles.loading, className)}>
            <Spinner className={styles.spinner} />
            <div className={_cs(styles.text, 'loading-text')}>
                {text}
            </div>
        </div>
    );
};

Loading.defaultProps = {
    pending: false,
    text: 'Loading data',
    className: undefined,
};

export default Loading;
