import React from 'react';
import { _cs } from '@togglecorp/fujs';

import ProgramWiseTable from './ProgramWiseTable';
import RegionWiseTable from './RegionWiseTable';
import { FiveW } from '../../types';
import { Indicator } from '#types';

import styles from './styles.css';

interface Props {
    className: string;
    fiveW: FiveW[] | undefined;
    indicatorList: Indicator[] | undefined;
    onCloseButtonClick: () => void;
    mode: 'region' | 'program';
}

function Stats(props: Props) {
    const {
        className,
        fiveW,
        indicatorList,
        onCloseButtonClick,
        mode,
    } = props;

    return (
        <div className={_cs(className, styles.stats)}>
            {mode === 'region' ? (
                <RegionWiseTable
                    onCloseButtonClick={onCloseButtonClick}
                    fiveW={fiveW}
                    indicatorList={indicatorList}
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
