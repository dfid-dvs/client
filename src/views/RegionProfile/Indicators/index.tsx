import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoMdClose, IoMdRefresh } from 'react-icons/io';

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
    indicatorsData: IndicatorValue[] | undefined;
    setIndicatorsHidden: () => void;
    fiveWData: FiveWData[] | undefined;
    printMode?: boolean;
    onAddHideableFiveWDataKeys?: (key: string) => void;
    onAddHideableIndicatorsIds?: (key: string) => void;
    resetIndicatorsShown?: boolean;
    onResetIndicators?: () => void;
}
export default function Indicators(props: IndicatorProps) {
    const {
        className,
        dataPending,
        setIndicatorsHidden,
        indicatorsData,
        fiveWData,
        printMode,
        onAddHideableFiveWDataKeys,
        onAddHideableIndicatorsIds,
        resetIndicatorsShown,
        onResetIndicators,
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
                        onHideData={onAddHideableFiveWDataKeys}
                        id={f.key}
                    />
                ))}
                {indicatorsData?.map(d => (
                    <NumberOutput
                        value={d.value || 0}
                        label={d.indicator}
                        key={d.indicatorId}
                        className={styles.numberOutput}
                        id={String(d.indicatorId)}
                        onHideData={onAddHideableIndicatorsIds}
                    />
                ))}
            </div>
            <div className={styles.buttonGroup}>
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
                {resetIndicatorsShown && onResetIndicators && (
                    <Button
                        onClick={onResetIndicators}
                        title="Reset Indicators"
                        transparent
                        variant="icon"
                        className={_cs(
                            styles.button,
                            printMode && styles.hidden,
                        )}
                        icons={<IoMdRefresh className={styles.hideIcon} />}
                    />
                )}
            </div>
        </div>
    );
}
