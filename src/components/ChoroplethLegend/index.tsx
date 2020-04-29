import React from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import Numeral from '#components/Numeral';

import styles from './styles.css';

interface LegendElementProps {
    color: string;
    value: string | number;
    opacity?: number;
    zeroPrecision?: boolean;
}

function LegendElement(props: LegendElementProps) {
    const {
        color,
        value,
        opacity = 1,
        zeroPrecision,
    } = props;

    return (
        <div
            className={styles.legendElement}
            key={color}
        >
            <div
                className={styles.color}
                style={{ backgroundColor: color, opacity }}
            />
            <div className={styles.value}>
                {typeof value === 'number' && (
                    <Numeral
                        value={value}
                        precision={zeroPrecision ? 0 : undefined}
                        normalize
                    />
                )}
                {typeof value === 'string' && (
                    value
                )}
            </div>
        </div>
    );
}

interface ChoroplethLegend {
    minValue: number | string;
    legend: {[key: string]: number | string};
    className?: string;
    title?: string;
    zeroPrecision?: boolean;
    opacity?: number;
}
function ChoroplethLegend(
    {
        title,
        minValue,
        legend,
        className,
        zeroPrecision,
        opacity,
    }: ChoroplethLegend,
) {
    const colors = Object.keys(legend);
    if (colors.length <= 0) {
        return null;
    }

    return (
        <div className={_cs(styles.legendContainer, className)}>
            {title && (
                <h5 className={styles.heading}>
                    {title}
                </h5>
            )}
            <div className={styles.choroplethLegend}>
                {isDefined(minValue) && (
                    <LegendElement
                        value={minValue}
                        color="white"
                        opacity={0}
                        zeroPrecision={zeroPrecision}
                    />
                )}
                {colors.map((color) => {
                    const value = legend[color];
                    return (
                        <LegendElement
                            key={color}
                            value={value}
                            color={color}
                            opacity={opacity}
                            zeroPrecision={zeroPrecision}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default ChoroplethLegend;
