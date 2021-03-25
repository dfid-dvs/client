import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoMdClose } from 'react-icons/io';

import Backdrop from '#components/Backdrop';
import LoadingAnimation from '#components/LoadingAnimation';
import Button from '#components/Button';
import { IndicatorValue } from '#types';

import styles from './styles.css';
import NumberOutput from '../NumberOutput';

type fiveWDataKey = 'componentCount' | 'programCount'
| 'sectorCount' | 'supplierCount' | 'totalBudget';

interface FiveWData {
    key: fiveWDataKey;
    label: string;
    value: number;
}

interface IndicatorProps {
    className?: string;
    dataPending: boolean;
    indicatorsData: IndicatorValue[];
    setIndicatorsHidden: () => void;
    fiveWData: FiveWData[] | undefined;
    printMode?: boolean;
}
export default function Indicators(props: IndicatorProps) {
    const {
        className,
        dataPending,
        setIndicatorsHidden,
        indicatorsData,
        fiveWData,
        printMode,
    } = props;

    return (
        <div className={_cs(styles.indicators, className)}>
            {dataPending && (
                <Backdrop className={styles.backdrop}>
                    <LoadingAnimation />
                </Backdrop>
            )}
            <div className={styles.regionDetails}>
                {fiveWData?.map(f => (
                    <NumberOutput
                        value={f.value || 0}
                        label={f.label}
                        key={f.key}
                        className={styles.numberOutput}
                    />
                ))}
                {indicatorsData.map(d => (
                    <NumberOutput
                        value={d.value || 0}
                        label={d.indicator}
                        key={d.indicatorId}
                        className={styles.numberOutput}
                    />
                ))}
            </div>
            <Button
                onClick={setIndicatorsHidden}
                title="Hide Indicators"
                transparent
                variant="icon"
                className={_cs(
                    styles.button,
                    printMode && styles.hidden,
                )}
            >
                <IoMdClose
                    className={styles.hideIcon}
                />
            </Button>
        </div>
    );
}
