import React from 'react';

import TextOutput from '#components/TextOutput';
import Numeral from '#components/Numeral';
import {
    Indicator,
} from '#types';

import { FiveW } from '../types';

import styles from './styles.css';

interface Region {
    name: string;
}

interface IndicatorWithValue extends Indicator{
    value: number | undefined;
}

interface Props {
    feature: GeoJSON.Feature<GeoJSON.Polygon, Region>;
    dfidData?: FiveW;
    indicatorData?: IndicatorWithValue;
}
const Tooltip = ({
    feature,
    dfidData,
    indicatorData,
}: Props) => (
    <div className={styles.tooltip}>
        <h3 className={styles.heading}>
            { feature.properties.name }
        </h3>
        {indicatorData && (
            <TextOutput
                label={indicatorData.fullTitle}
                value={(
                    <Numeral
                        value={indicatorData.value}
                    />
                )}
            />
        )}
        {dfidData && (
            <>
                <TextOutput
                    label="Allocated Budget"
                    value={(
                        <Numeral
                            value={dfidData.allocatedBudget}
                            prefix="£"
                        />
                    )}
                />
                <TextOutput
                    label="Sectors"
                    value={(
                        <Numeral
                            value={dfidData.sector.length}
                        />
                    )}
                />
                <TextOutput
                    label="Components"
                    value={(
                        <Numeral
                            value={dfidData.component.length}
                        />
                    )}
                />
                <TextOutput
                    label="Partners"
                    value={(
                        <Numeral
                            value={dfidData.partner.length}
                        />
                    )}
                />
            </>
        )}
    </div>
);
export default Tooltip;
