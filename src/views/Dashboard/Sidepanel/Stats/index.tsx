import React from 'react';
import { _cs } from '@togglecorp/fujs';

import ProgramWiseTable from './ProgramWiseTable';
import RegionWiseTable from './RegionWiseTable';
import { FiveW } from '../../types';

import styles from './styles.css';

interface Props {
    className: string;
    fiveW: FiveW[] | undefined;
    onCloseButtonClick: () => void;
}

function Stats(props: Props) {
    const {
        className,
        fiveW,
        onCloseButtonClick,
    } = props;

    return (
        <div className={_cs(className, styles.stats)}>
            { fiveW ? (
                <RegionWiseTable
                    onCloseButtonClick={onCloseButtonClick}
                    fiveW={fiveW}
                />
            ) : (
                <ProgramWiseTable
                    onCloseButtonClick={onCloseButtonClick}
                />
            )}
        </div>
    );
}
export default Stats;
