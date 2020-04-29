import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import List from '#components/List';
import Numeral from '#components/Numeral';

import { OptionKey } from '../types';
import styles from './styles.css';

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

interface Props<T, K extends OptionKey> {
    data: T[];
    className?: string;
    title?: string;
    keySelector: (datum: T) => K;
    radiusSelector: (datum: T) => number;
    valueSelector: (datum: T) => number;
    colorSelector?: (datum: T) => string;
    itemClassName?: string;
    positiveColor?: string;
    negativeColor?: string;
}

function BubbleLegend<T, K extends OptionKey>(props: Props<T, K>) {
    const {
        className,
        data,
        radiusSelector,
        valueSelector,
        colorSelector,
        keySelector,
        itemClassName,
        title,
        negativeColor,
        positiveColor,
    } = props;

    const legendItemRendererParams = useCallback((_: K, d: T, i: number, allData: T[]) => {
        const radiuses = radiusSelector
            ? allData.map(radiusSelector)
            : [];

        const maxRadius = Math.max(...radiuses);

        return ({
            value: valueSelector(d),
            color: colorSelector ? colorSelector(d) : '#aeaeae',
            radius: radiusSelector ? radiusSelector(d) : undefined,
            maxRadius,
            className: itemClassName,
        });
    }, [radiusSelector, valueSelector, colorSelector, itemClassName]);

    if (data.length <= 0) {
        return null;
    }

    return (
        <div className={_cs(styles.bubbleLegend, className)}>
            {title && (
                <h5 className={styles.heading}>
                    {title}
                </h5>
            )}
            <List
                data={data}
                renderer={LegendItem}
                keySelector={keySelector}
                rendererParams={legendItemRendererParams}
            />
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
        </div>
    );
}

BubbleLegend.defaultProps = {
    data: [],
    positiveColor: '#01665e',
    negativeColor: '#de2d26',
};

export default BubbleLegend;
