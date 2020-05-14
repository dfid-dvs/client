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

import styles from './styles.css';

interface Props {
    className?: string;
    fiveWList: FiveW[];
}

function Sidepanel(props: Props) {
    const {
        className,
        fiveWList,
    } = props;

    const [statMode, setStatMode] = React.useState<'program' | 'region' | undefined>(undefined);
    const [isHidden, setIsHidden] = React.useState(false);
    const handleToggleVisibilityButtonClick = React.useCallback(() => {
        setIsHidden(prevValue => !prevValue);
    }, [setIsHidden]);

    const handleRegionSummaryMoreClick = React.useCallback(() => {
        setStatMode('region');
    }, [setStatMode]);

    const handleDFIDSummaryMoreClick = React.useCallback(() => {
        setStatMode('program');
    }, [setStatMode]);

    const handleStatCloseButtonClick = React.useCallback(() => {
        setStatMode(undefined);
    }, [setStatMode]);

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
                    fiveW={statMode === 'region' ? fiveWList : undefined}
                    onCloseButtonClick={handleStatCloseButtonClick}
                />
            )}
        </>
    );
}

export default Sidepanel;
