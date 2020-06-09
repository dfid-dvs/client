import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { Indicator } from '#types';
import useHash from '#hooks/useHash';

import ProgramWiseTable from './ProgramWiseTable';
import RegionWiseTable from './RegionWiseTable';
import { FiveW } from '../../types';

import styles from './styles.css';

interface Props {
    className: string;
    fiveW: FiveW[] | undefined;
    indicatorList: Indicator[] | undefined;
    onCloseButtonClick: () => void;
}

function Stats(props: Props) {
    const {
        className,
        fiveW,
        indicatorList,
        onCloseButtonClick,
    } = props;

    const hash = useHash();

    return (
        <>
            {hash === 'regions' && (
                <div className={_cs(className, styles.stats)}>
                    <RegionWiseTable
                        onCloseButtonClick={onCloseButtonClick}
                        fiveW={fiveW}
                        indicatorList={indicatorList}
                    />
                </div>
            )}
            {hash === 'programs' && (
                <div className={_cs(className, styles.stats)}>
                    <ProgramWiseTable
                        onCloseButtonClick={onCloseButtonClick}
                    />
                </div>
            )}
        </>
    );
}
export default Stats;
