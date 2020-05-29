import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Backdrop from '#components/Backdrop';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Glossary(props: Props) {
    const { className } = props;

    return (
        <div className={_cs(className, styles.glossary)}>
            <Backdrop>
                Glossary
            </Backdrop>
        </div>
    );
}
export default Glossary;
