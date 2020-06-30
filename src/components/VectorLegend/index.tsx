import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { typedMemo } from '#utils/common';

import List from '#components/List';
import { VectorLayer } from '#types';

import styles from './styles.css';

export type VectorLegendType = 'positive' | 'negative' | 'both';

interface LegendItemProps {
    className?: string;
    title: string;
    color?: string;
    radius?: number;
}

export function LegendItem(props: LegendItemProps) {
    const {
        className,
        title,
        color = 'black',
        radius = 5,
    } = props;

    return (
        <div className={_cs(className, styles.legendItem)}>
            <div
                className={styles.color}
                style={{
                    backgroundColor: color,
                    width: `${2 * radius}px`,
                    height: `${2 * radius}px`,
                }}
            />
            <div className={styles.value}>
                {title}
            </div>
        </div>
    );
}


const layerKeySelector = (layer: VectorLayer) => layer.id;

interface Props {
    className?: string;
    vectorLayers: VectorLayer[];
}

function VectorLegend(props: Props) {
    const {
        className,
        vectorLayers,
    } = props;

    const legendItemRendererParams = useCallback(
        (_: number, d: VectorLayer) => ({
            title: d.name,
            color: d.style[0]?.circleColor,
            radius: 6,
            // radius: d.style[0]?.circleRadius,
        }),
        [],
    );

    return (
        <div className={_cs(styles.vectorLegend, className)}>
            <h5 className={styles.heading}>
                Layers
            </h5>
            <List
                data={vectorLayers.filter(layer => layer.geoType === 'point')}
                renderer={LegendItem}
                keySelector={layerKeySelector}
                rendererParams={legendItemRendererParams}
            />
        </div>
    );
}

export default typedMemo(VectorLegend);
