import React from 'react';
import { unique } from '@togglecorp/fujs';

import TextOutput from '#components/TextOutput';
import Numeral from '#components/Numeral';
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
    dfidData?: CovidFiveW[];
    indicatorData?: { label?: string; value?: number };
}

const Tooltip = ({
    feature,
    dfidData,
    indicatorData,
}: Props) => {
    if (!feature) {
        return null;
    }
    if (dfidData) {
        const uniqueProjects = unique(dfidData, d => d.projectName);
        const uniqueSectors = unique(dfidData, d => d.sector);
        return (
            <div className={styles.tooltip}>
                {feature.properties && (
                    <div className={styles.regionTitle}>
                        { feature.properties.name }
                    </div>
                )}
                { indicatorData && indicatorData.label && (
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
                <div className={styles.content}>
                    { uniqueProjects && uniqueProjects.length > 0 && (
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
                    { uniqueSectors && uniqueSectors.length > 0 && (
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
            { indicatorData && indicatorData.label && (
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
        </div>
    );
};

export default Tooltip;
