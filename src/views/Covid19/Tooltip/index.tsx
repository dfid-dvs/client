import React from 'react';
import { unique } from '@togglecorp/fujs';

import TextOutput from '#components/TextOutput';
import Numeral from '#components/Numeral';
import List from '#components/List';

import { CovidFiveW } from '../types';

import styles from './styles.css';

const componentKeySelector = (d: CovidFiveW) => d.component;
const componentRendererParams = (_: string, d: CovidFiveW, i: number) => ({
    value: d,
    index: i + 1,
});
interface ComponentItemProps {
    index: number;
    value: CovidFiveW;
}
const ComponentItem = ({ index, value }: ComponentItemProps) => (
    <div className={styles.listItem}>
        <div className={styles.count}>
            {`${index}.`}
        </div>
        <div className={styles.label}>
            <div>
                {value.component}
            </div>
            <TextOutput
                label="Allocated Budget"
                value={(
                    <Numeral
                        value={value.budget}
                        prefix="£"
                    />
                )}
            />
            <TextOutput
                label="Sector"
                value={value.sector}
            />
            <TextOutput
                label="Partner"
                value={value.secondTierPartner}
            />
        </div>
    </div>
);

const sectorKeySelector = (d: CovidFiveW) => d.sector;
const sectorRendererParams = (_: string, d: CovidFiveW, i: number) => ({
    value: d.sector,
    index: i + 1,
});
const SectorItem = ({ value, index }: { value: string; index: number }) => (
    <div className={styles.listItem}>
        <div className={styles.count}>
            {`${index}.`}
        </div>
        <div className={styles.label}>
            {value}
        </div>
    </div>
);


interface Region {
    name: string;
}

interface Props {
    feature: GeoJSON.Feature<GeoJSON.Polygon, Region>;
    dfidData?: CovidFiveW[];
    indicatorData?: { label?: string; value?: number };
}

const Tooltip = ({
    feature,
    dfidData,
    indicatorData,
}: Props) => {
    const uniqueComponents = unique(dfidData, d => d.component);
    const uniqueSectors = unique(dfidData, d => d.sector);
    // const totalBudget = uniqueComponents && sum(uniqueComponents.map(d => d.budget));

    return (
        <div className={styles.tooltip}>
            <h3>
                { feature.properties.name }
            </h3>
            {indicatorData && indicatorData.label && (
                <TextOutput
                    label={indicatorData.label}
                    value={(
                        <Numeral
                            value={indicatorData.value}
                            normalize
                        />
                    )}
                />
            )}
            {/* totalBudget && (
                <TextOutput
                    label="Allocated Budget"
                    value={(
                        <div className={styles.budget}>
                            <Numeral
                                value={totalBudget}
                                prefix="£"
                            />
                        </div>
                    )}
                />
            ) */}
            {uniqueSectors && (
                <TextOutput
                    label="No of sectors"
                    value={(
                        <Numeral
                            value={uniqueSectors.length}
                        />
                    )}
                />
            )}
            {uniqueComponents && (
                <TextOutput
                    label="No of components"
                    value={(
                        <Numeral
                            value={uniqueComponents.length}
                        />
                    )}
                />
            )}
            <div className={styles.content}>
                {uniqueSectors && uniqueSectors.length > 0 && (
                    <div className={styles.sectors}>
                        <h4>Sectors</h4>
                        <List
                            data={uniqueSectors}
                            keySelector={sectorKeySelector}
                            rendererParams={sectorRendererParams}
                            renderer={SectorItem}
                        />
                    </div>
                )}
                {uniqueComponents && uniqueComponents.length > 0 && (
                    <div className={styles.components}>
                        <h4>Components</h4>
                        <List
                            data={uniqueComponents}
                            keySelector={componentKeySelector}
                            rendererParams={componentRendererParams}
                            renderer={ComponentItem}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tooltip;
