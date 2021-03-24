import React, { memo } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import Numeral from '#components/Numeral';

import styles from './styles.css';

interface LegendElementProps {
    color: string;
    value: string | number;
    opacity?: number;
    suffix?: string;
}

function LegendElement(props: LegendElementProps) {
    const {
        color,
        value,
        opacity = 1,
        suffix,
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
                        className={styles.numeral}
                        value={value}
                        normalize
                    />
                )}
                {typeof value === 'string' && (
                    <span>
                        {value}
                    </span>
                )}
                {suffix && (
                    <span className={styles.suffix}>
                        {suffix}
                    </span>
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
    opacity?: number;
    unit?: string;
    minExceeds?: boolean;
    maxExceeds?: boolean;
    pending?: boolean;
}
function ChoroplethLegend(
    {
        title,
        minValue,
        legend,
        className,
        opacity,
        unit,
        minExceeds,
        maxExceeds,
        pending,
    }: ChoroplethLegend,
) {
    const colors = Object.keys(legend);

    return (
        <div className={_cs(styles.legendContainer, className)}>
            {pending && (
                <Backdrop>
                    <LoadingAnimation />
                </Backdrop>
            )}
            {title && (
                <div className={styles.heading}>
                    {unit ? `${title} (${unit})` : title}
                </div>
            )}
            {colors.length > 0 ? (
                <div className={styles.choroplethLegend}>
                    {isDefined(minValue) && (
                        <LegendElement
                            value={minValue}
                            color="white"
                            opacity={0}
                            suffix={minExceeds ? 'or less' : undefined}
                        />
                    )}
                    {colors.map((color, index) => {
                        const value = legend[color];
                        const isLastElement = index === colors.length - 1;
                        return (
                            <LegendElement
                                key={color}
                                value={value}
                                color={color}
                                opacity={opacity}
                                suffix={isLastElement && maxExceeds ? 'or more' : undefined}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className={styles.noDataText}>
                    No data to show
                </div>
            )}
        </div>
    );
}

export default memo(ChoroplethLegend);
