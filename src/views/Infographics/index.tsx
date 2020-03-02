import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
}

const Infographics = (props: Props) => {
    const { className } = props;

    return (
        <div className={_cs(className, styles.infographics)}>
            Infographics
        </div>
    );
};

export default Infographics;
