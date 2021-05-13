import React, { useMemo } from 'react';
import { compareString, listToGroupList, _cs } from '@togglecorp/fujs';
import { IoMdClose, IoMdRefresh } from 'react-icons/io';

import Backdrop from '#components/Backdrop';
import LoadingAnimation from '#components/LoadingAnimation';
import Button from '#components/Button';
import { IndicatorValue } from '#types';

import styles from './styles.css';
import NumberOutput from '../NumberOutput';
import GroupedIndicator from './GroupedIndicator';

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
    onAddHideableIndicatorsIds?: (category: string, indicatorId: string) => void;
    resetIndicatorsShown?: boolean;
    onResetIndicators?: () => void;
    onAddHideableIndicatorsCategories?: (key: string) => void;
    resetBekShown?: boolean;
    onResetBek?: () => void;
    onHideBekData?: () => void;
    bekDataHidden?: boolean;
    onResetCategory?: (category: string) => void;
    resettableIndicatorCategories: string[] | undefined;
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
        onAddHideableIndicatorsCategories,
        resetBekShown,
        onResetBek,
        onHideBekData,
        bekDataHidden,
        onResetCategory,
        resettableIndicatorCategories,
    } = props;

    const groupedIndicatorsData = useMemo(
        () => {
            if (!indicatorsData) {
                return undefined;
            }
            const indicators = [...indicatorsData];
            return listToGroupList(
                indicators.sort(
                    (a, b) => compareString(
                        a.indicator,
                        b.indicator,
                    ),
                ),
                item => item.category,
            );
        },
        [indicatorsData],
    );

    const categories = useMemo(
        () => {
            if (!groupedIndicatorsData) {
                return undefined;
            }
            return Object.keys(groupedIndicatorsData)
                .sort((a, b) => compareString(a, b));
        },
        [groupedIndicatorsData],
    );

    return (
        <div className={_cs(styles.indicators, className)}>
            {dataPending && (
                <Backdrop className={styles.backdrop}>
                    <LoadingAnimation />
                </Backdrop>
            )}
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
                    icons={<IoMdClose className={styles.hideIcon} />}
                />
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
            <div className={styles.regionDetails}>
                {!bekDataHidden && (
                    <div
                        className={_cs(
                            styles.categoryContainer,
                            styles.containerShown,
                            fiveWData && fiveWData.length === 0 && styles.containerHidden,
                        )}
                    >
                        <div className={styles.category}>
                            BEK Data
                            <div className={styles.buttonGroup}>
                                {onHideBekData && (
                                    <Button
                                        onClick={onHideBekData}
                                        title="Hide"
                                        transparent
                                        variant="icon"
                                        className={_cs(
                                            styles.button,
                                            printMode && styles.hidden,
                                        )}
                                        icons={<IoMdClose className={styles.hideIcon} />}
                                    />
                                )}
                                {resetBekShown && onResetBek && (
                                    <Button
                                        onClick={onResetBek}
                                        title="Reset"
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
                        <div className={styles.data}>
                            {fiveWData?.map(f => (
                                <NumberOutput
                                    value={f.value || 0}
                                    label={f.label}
                                    key={f.key}
                                    className={styles.numberOutput}
                                    onHideData={onAddHideableFiveWDataKeys}
                                    id={f.key}
                                    printMode={printMode}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {groupedIndicatorsData && categories?.map(cat => (
                    <GroupedIndicator
                        key={cat}
                        className={styles.categoryContainer}
                        category={cat}
                        handleHideIndicatorId={onAddHideableIndicatorsIds}
                        printMode={printMode}
                        groupedData={groupedIndicatorsData[cat]}
                        onHideCategory={onAddHideableIndicatorsCategories}
                        onResetCategory={onResetCategory}
                        resettableIndicatorCategories={resettableIndicatorCategories}
                    />
                ))}
                {/* {categories.map((cat) => (
                    <div
                        key={cat}
                        className={styles.categoryContainer}
                    >
                        <div className={styles.category}>
                            {cat}
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
                        <div className={styles.data}>
                            {groupedIndicatorsData[cat].map(d => (
                                <NumberOutput
                                    value={d.value ||
                                            0}
                                    label={d.indicator}
                                    key={d.indicatorId}
                                    className={styles.numberOutput}
                                    id={String(d.indicatorId)}
                                    onHideData={onAddHideableIndicatorsIds}
                                    printMode={printMode}
                                />
                            ))}
                        </div>
                    </div>
                ))} */}
            </div>
        </div>
    );
}
