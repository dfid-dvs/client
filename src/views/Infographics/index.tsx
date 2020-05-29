import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Backdrop from '#components/Backdrop';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Infographics(props: Props) {
    const { className } = props;

    return (
        <div className={_cs(className, styles.infographics)}>
            <Backdrop>
                Infographics
            </Backdrop>
        </div>
    );
}
export default Infographics;
