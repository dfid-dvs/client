import React from 'react';
import { unique } from '@togglecorp/fujs';

import TextOutput from '#components/TextOutput';
import List from '#components/List';

import { CovidFiveW } from '#types';

import styles from './styles.css';

const projectKeySelector = (d: CovidFiveW) => d.projectName;
const projectRendererParams = (_: string, d: CovidFiveW) => ({ value: d.projectName });
const sectorKeySelector = (d: CovidFiveW) => d.sector;
const sectorRendererParams = (_: string, d: CovidFiveW) => ({ value: d.sector });
const ListItem = ({ value }: { value: string}) => <div>{value}</div>;

interface Props {
    feature: mapboxgl.MapboxGeoJSONFeature;
    data?: CovidFiveW[];
}

const Tooltip = ({
    feature,
    data,
}: Props) => {
    if (!feature) {
        return null;
    }
    if (data) {
        const uniqueProjects = unique(data, d => d.projectName);
        const uniqueSectors = unique(data, d => d.sector);
        return (
            <div className={styles.tooltip}>
                {feature.properties && (
                    <div className={styles.regionTitle}>
                        { feature.properties.name }
                    </div>
                )}
                <div className={styles.content}>
                    { uniqueProjects && (
                        <div className={styles.projects}>
                            Projects
                            <TextOutput
                                label="No of projects"
                                value={uniqueProjects.length}
                            />
                            <List
                                data={uniqueProjects}
                                keySelector={projectKeySelector}
                                rendererParams={projectRendererParams}
                                renderer={ListItem}
                            />
                        </div>
                    )}
                    { uniqueSectors && (
                        <div className={styles.sectors}>
                            Sectors
                            <TextOutput
                                label="No of sectors"
                                value={uniqueSectors.length}
                            />
                            <List
                                data={uniqueSectors}
                                keySelector={sectorKeySelector}
                                rendererParams={sectorRendererParams}
                                renderer={ListItem}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.tooltip}>
            {feature.properties && (
                <div className={styles.regionTitle}>
                    { feature.properties.name }
                </div>
            )}
            {feature.state && (
                <div className={styles.value}>
                    { feature.state.value }
                </div>
            )}
        </div>
    );
};

export default Tooltip;
