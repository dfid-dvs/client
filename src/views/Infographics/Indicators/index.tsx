import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoMdClose } from 'react-icons/io';

import styles from './styles.css';
import NumberOutput from '../NumberOutput';
import Backdrop from '#components/Backdrop';
import LoadingAnimation from '#components/LoadingAnimation';
import Button from '#components/Button';

type numericDataKey = 'finance' | 'healthPerThousand' | 'population'
| 'povertyGap' | 'budget' | 'programs' | 'partners' | 'sectors';

interface NumericData {
    key: numericDataKey;
    label: string;
    value: number;
}

interface IndicatorProps {
    className?: string;
    dataPending: boolean;
    numericDataList: NumericData[];
    numericData: {
        budget: number;
        name: string;
        partners: number;
        programs: number;
        sectors: number;
        subSectors: number;
        components: number;
        population?: number;
        povertyGap?: number;
        finance?: number;
        health?: number;
        healthPerThousand?: number;
    };
    setIndicatorsHidden: () => void;
}
export default function Indicators(props: IndicatorProps) {
    const {
        className,
        dataPending,
        numericDataList,
        numericData,
        setIndicatorsHidden,
    } = props;

    return (
        <div className={_cs(styles.indicators, className)}>
            {dataPending && (
                <Backdrop className={styles.backdrop}>
                    <LoadingAnimation />
                </Backdrop>
            )}
            <div className={styles.regionDetails}>
                {numericDataList.map((d: NumericData) => (
                    <NumberOutput
                        value={numericData[d.key] || 0}
                        label={d.label}
                        key={d.key}
                        className={styles.numberOutput}
                    />
                ))}
            </div>
            <Button
                onClick={setIndicatorsHidden}
                title="Hide Indicators"
                transparent
                variant="icon"
                className={styles.button}
            >
                <IoMdClose
                    className={styles.hideIcon}
                />
            </Button>
        </div>
    );
}
