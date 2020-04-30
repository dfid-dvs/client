import React from 'react';
import { unique } from '@togglecorp/fujs';

import TextOutput from '#components/TextOutput';
import Numeral from '#components/Numeral';
import List from '#components/List';

import { CovidFiveW } from '#types';

import styles from './styles.css';

const projectKeySelector = (d: CovidFiveW) => d.projectName;
const projectRendererParams = (_: string, d: CovidFiveW, i: number) => ({
    value: d.projectName,
    index: i + 1,
});

const sectorKeySelector = (d: CovidFiveW) => d.sector;
const sectorRendererParams = (_: string, d: CovidFiveW, i: number) => ({
    value: d.sector,
    index: i + 1,
});

const ListItem = ({ value, index }: { value: string; index: number }) => (
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
    const uniqueProjects = unique(dfidData, d => d.projectName);
    const uniqueSectors = unique(dfidData, d => d.sector);

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
            {uniqueProjects && (
                <TextOutput
                    label="No of projects"
                    value={(
                        <Numeral
                            value={uniqueProjects.length}
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
                            renderer={ListItem}
                        />
                    </div>
                )}
                {uniqueProjects && uniqueProjects.length > 0 && (
                    <div className={styles.projects}>
                        <h4>Projects</h4>
                        <List
                            data={uniqueProjects}
                            keySelector={projectKeySelector}
                            rendererParams={projectRendererParams}
                            renderer={ListItem}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tooltip;
