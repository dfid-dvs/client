import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { typedMemo } from '#utils/common';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import List from '#components/List';
import Numeral from '#components/Numeral';

import { OptionKey } from '../types';
import styles from './styles.css';

export type BubbleLegendType = 'positive' | 'negative' | 'both';

interface LegendItemProps {
    className?: string;
    value: number;
    radius?: number;
    maxRadius: number;
    color: string;
}

function LegendItem(props: LegendItemProps) {
    const {
        className,
        value,
        color,
        radius = 5,
        maxRadius = 5,
    } = props;

    return (
        <div className={_cs(className, styles.legendItem)}>
            <div
                className={styles.color}
                style={{
                    backgroundColor: color,
                    width: `${2 * radius}px`,
                    height: `${2 * radius}px`,
                    margin: `${maxRadius - radius}px`,
                }}
            />
            <div className={styles.value}>
                <Numeral
                    value={value}
                    normalize
                />
            </div>
        </div>
    );
}

interface Props<T, K> {
    data: T[];
    className?: string;
    title?: string;
    keySelector: (datum: T) => K;
    radiusSelector: (datum: T) => number;
    valueSelector: (datum: T) => number;
    itemClassName?: string;
    legendType: BubbleLegendType;
    positiveColor?: string;
    negativeColor?: string;
    unit?: string;
    pending?: boolean;
}

function BubbleLegend<T, K extends OptionKey>(props: Props<T, K>) {
    const {
        className,
        data,
        radiusSelector,
        valueSelector,
        keySelector,
        itemClassName,
        title,
        negativeColor,
        positiveColor,
        legendType,
        unit,
        pending,
    } = props;

    const legendItemRendererParams = useCallback((_: K, d: T, i: number, allData: T[]) => {
        const radiuses = radiusSelector
            ? allData.map(radiusSelector)
            : [];

        const maxRadius = Math.max(...radiuses);

        let color = '#aeaeae';
        if (legendType === 'positive' && positiveColor) {
            color = positiveColor;
        } else if (legendType === 'negative' && negativeColor) {
            color = negativeColor;
        }

        return ({
            value: valueSelector(d),
            color,
            radius: radiusSelector ? radiusSelector(d) : undefined,
            maxRadius,
            className: itemClassName,
        });
    }, [
        radiusSelector,
        valueSelector,
        itemClassName,
        negativeColor,
        positiveColor,
        legendType,
    ]);

    return (
        <div
            className={_cs(
                styles.bubbleLegend,
                className,
                data.length <= 0 && styles.noData,
            )}
        >
            {pending && (
                <Backdrop>
                    <LoadingAnimation />
                </Backdrop>
            )}
            {title && (
                <h5 className={styles.heading}>
                    {unit ? `${title} (${unit})` : title}
                </h5>
            )}
            {data.length > 0 ? (
                <>
                    <List
                        data={data}
                        renderer={LegendItem}
                        keySelector={keySelector}
                        rendererParams={legendItemRendererParams}
                    />
                    {legendType === 'both' && (
                        <div className={styles.footer}>
                            <div className={styles.negative}>
                                <span
                                    className={styles.circle}
                                    style={{ backgroundColor: negativeColor }}
                                />
                                Less than 0
                            </div>
                            <div className={styles.positive}>
                                <span
                                    className={styles.circle}
                                    style={{ backgroundColor: positiveColor }}
                                />
                                Greater than 0
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className={styles.noDataText}>
                    No data to show
                </div>
            )}
        </div>
    );
}

BubbleLegend.defaultProps = {
    data: [],
    positiveColor: '#01665e',
    negativeColor: '#de2d26',
};

export default typedMemo(BubbleLegend);
