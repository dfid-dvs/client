import React from 'react';

import TextOutput from '#components/TextOutput';
import Numeral from '#components/Numeral';

import { FiveW } from '../types';

import styles from './styles.css';

interface Region {
    name: string;
}

interface Props {
    feature: GeoJSON.Feature<GeoJSON.Polygon, Region>;
    dfidData?: FiveW;
}
const Tooltip = ({
    feature,
    dfidData,
}: Props) => (
    <div className={styles.tooltip}>
        <h3>
            { feature.properties.name }
        </h3>
        {dfidData && dfidData.id && (
            <div>
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
                    label="Male Beneficiary"
                    value={(
                        <Numeral
                            value={dfidData.maleBeneficiary}
                        />
                    )}
                />
                <TextOutput
                    label="Female Beneficiary"
                    value={(
                        <Numeral
                            value={dfidData.femaleBeneficiary}
                        />
                    )}
                />
                <TextOutput
                    label="Total Beneficiary"
                    value={(
                        <Numeral
                            value={dfidData.totalBeneficiary}
                        />
                    )}
                />
            </div>
        )}
    </div>
);
export default Tooltip;
