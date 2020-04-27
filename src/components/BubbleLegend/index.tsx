import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import { OptionKey } from '../types';
import List from '#components/List';

import styles from './styles.css';

interface LegendItemProps {
    className?: string;
    label: string | number;
    radius?: number;
    maxRadius: number;
    color: string;
}

function LegendItem(props: LegendItemProps) {
    const {
        className,
        label,
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
            <div className={styles.label}>
                { label }
            </div>
        </div>
    );
}

interface Props<T, K extends OptionKey> {
    data: T[];
    className?: string;
    keySelector: (datum: T) => K;
    radiusSelector: (datum: T) => number;
    labelSelector: (datum: T) => string | number;
    colorSelector: (datum: T) => string;
    itemClassName?: string;
}

function BubbleLegend<T, K extends OptionKey>(props: Props<T, K>) {
    const {
        className,
        data,
        radiusSelector,
        labelSelector,
        colorSelector,
        keySelector,
        itemClassName,
    } = props;

    const legendItemRendererParams = useCallback((_: K, d: T, i: number, allData: T[]) => {
        const radiuses = radiusSelector
            ? allData.map(radiusSelector)
            : [];

        const maxRadius = Math.max(...radiuses);

        return ({
            label: labelSelector(d),
            color: colorSelector(d),
            radius: radiusSelector ? radiusSelector(d) : undefined,
            maxRadius,
            className: itemClassName,
        });
    }, [radiusSelector, labelSelector, colorSelector, itemClassName]);

    return (
        <div className={_cs(styles.bubbleLegend, className)}>
            <List
                data={data}
                renderer={LegendItem}
                keySelector={keySelector}
                rendererParams={legendItemRendererParams}
            />
        </div>
    );
}

BubbleLegend.defaultProps = {
    data: [],
};

export default BubbleLegend;
