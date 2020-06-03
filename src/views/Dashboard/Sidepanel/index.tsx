import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoIosArrowForward,
    IoIosArrowBack,
} from 'react-icons/io';
import Stats from './Stats';

import Button from '#components/Button';
import Summary from './Summary';

import { FiveW } from '../types';
import { Indicator } from '#types';

import styles from './styles.css';

interface Props {
    className?: string;
    fiveWList: FiveW[];
    indicatorList?: Indicator[];
}

function Sidepanel(props: Props) {
    const {
        className,
        fiveWList,
        indicatorList,
    } = props;

    const [statMode, setStatMode] = React.useState<'program' | 'region' | undefined>(undefined);
    const [isHidden, setIsHidden] = React.useState(false);

    const handleToggleVisibilityButtonClick = React.useCallback(() => {
        setIsHidden(prevValue => !prevValue);
    }, []);

    const handleRegionSummaryMoreClick = React.useCallback(() => {
        setStatMode('region');
    }, []);

    const handleDFIDSummaryMoreClick = React.useCallback(() => {
        setStatMode('program');
    }, []);

    const handleStatCloseButtonClick = React.useCallback(() => {
        setStatMode(undefined);
    }, []);

    return (
        <>
            <div className={_cs(
                className,
                styles.sidepanel,
                isHidden && styles.hidden,
            )}
            >
                <Button
                    className={styles.toggleVisibilityButton}
                    onClick={handleToggleVisibilityButtonClick}
                    icons={isHidden ? <IoIosArrowBack /> : <IoIosArrowForward />}
                    transparent
                />
                <Summary
                    onRegionSummaryMoreClick={handleRegionSummaryMoreClick}
                    onDFIDSummaryMoreClick={handleDFIDSummaryMoreClick}
                />
            </div>
            { statMode && (
                <Stats
                    className={styles.stats}
                    mode={statMode}
                    indicatorList={indicatorList}
                    fiveW={fiveWList}
                    onCloseButtonClick={handleStatCloseButtonClick}
                />
            )}
        </>
    );
}

export default Sidepanel;
