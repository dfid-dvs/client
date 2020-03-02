import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
}

const Glossary = (props: Props) => {
    const { className } = props;

    return (
        <div className={_cs(className, styles.glossary)}>
            Glossary
        </div>
    );
};

export default Glossary;
