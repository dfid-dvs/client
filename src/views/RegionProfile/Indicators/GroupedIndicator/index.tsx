import React, { useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoMdClose, IoMdRefresh } from 'react-icons/io';

import Button from '#components/Button';
import { IndicatorValue } from '#types';

import NumberOutput from '../../NumberOutput';

import styles from './styles.css';

interface Props {
    category: string;
    className?: string;
    handleHideIndicatorId?: (category: string, indicatorId: string) => void;
    onHideCategory?: (category: string) => void;
    printMode?: boolean;
    groupedData: IndicatorValue[];
    onResetCategory?: (category: string) => void;
    resettableIndicatorCategories: string[] | undefined;
}
export default function GroupedIndicator(props: Props) {
    const {
        category,
        className,
        handleHideIndicatorId,
        printMode,
        groupedData,
        onHideCategory,
        onResetCategory,
        resettableIndicatorCategories,
    } = props;

    const handleHideCategory = useCallback(
        () => {
            if (!onHideCategory) {
                return;
            }
            onHideCategory(category);
        },
        [category, onHideCategory],
    );

    const handleResetCategory = useCallback(
        () => {
            if (!onResetCategory) {
                return;
            }
            onResetCategory(category);
        },
        [category, onResetCategory],
    );

    const resetButtonShown = useMemo(
        () => resettableIndicatorCategories?.includes(category),
        [resettableIndicatorCategories, category],
    );

    const onHideIndicatorId = useCallback(
        (id: string) => {
            if (!handleHideIndicatorId) {
                return;
            }
            handleHideIndicatorId(category, id);
        },
        [handleHideIndicatorId, category],
    );

    return (
        <div
            className={_cs(
                styles.categoryContainer,
                className,
            )}
        >
            <div className={styles.category}>
                {category}
                <div className={styles.buttonGroup}>
                    <Button
                        onClick={handleHideCategory}
                        title="Hide Category"
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
                    {onResetCategory && (
                        <Button
                            onClick={handleResetCategory}
                            title="Reset Indicators"
                            transparent
                            variant="icon"
                            className={_cs(
                                styles.button,
                                printMode && styles.hidden,
                                !resetButtonShown && styles.hidden,
                            )}
                            icons={<IoMdRefresh className={styles.hideIcon} />}
                        />
                    )}
                </div>
            </div>
            <div className={styles.data}>
                {groupedData?.map(f => (
                    <NumberOutput
                        value={f.value || 0}
                        label={f.indicator}
                        key={f.indicatorId}
                        className={styles.numberOutput}
                        onHideData={onHideIndicatorId}
                        id={String(f.indicatorId)}
                        printMode={printMode}
                    />
                ))}
            </div>
        </div>
    );
}
