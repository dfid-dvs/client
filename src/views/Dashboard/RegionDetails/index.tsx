import React, { useContext, useState } from 'react';

import SegmentInput from '#components/SegmentInput';
import DomainContext from '#components/DomainContext';
import PopupPage from '#components/PopupPage';

import { Indicator } from '#types';

import Table from './Table';
import Charts from './Charts';
import Sankey from './Sankey';

import styles from './styles.css';

type TabOptionKeys = 'table' | 'charts' | 'sankey';
interface TabOption {
    key: TabOptionKeys;
    label: string;
}
const tabOptions: TabOption[] = [
    { key: 'table', label: 'Table' },
    { key: 'charts', label: 'Charts' },
    { key: 'sankey', label: 'Sankey' },
];

interface RegionDetailsProps {
    className?: string;
    indicatorList: Indicator[] | undefined;
    indicatorListPending: boolean | undefined;
}

function RegionDetails(props: RegionDetailsProps) {
    const {
        className,
        indicatorList,
        indicatorListPending,
    } = props;

    const { regionLevel: regionLevelFromContext, programs } = useContext(DomainContext);

    const [regionLevel, setRegionLevel] = useState(regionLevelFromContext);
    const [selectedTab, setSelectedTab] = useState<TabOptionKeys>('table');

    const [
        selectedRegions,
        setSelectedRegions,
    ] = useState<number[]>([]);

    const [selectedIndicators, setSelectedIndicators] = useState<number[]>([]);

    return (
        <PopupPage
            className={className}
            title="Regions"
            parentLink="/dashboard/"
            parentName="dashboard"
            actions={(
                <div className={styles.tabActions}>
                    <SegmentInput
                        options={tabOptions}
                        optionKeySelector={item => item.key}
                        optionLabelSelector={item => item.label}
                        value={selectedTab}
                        onChange={setSelectedTab}
                    />
                </div>
            )}
        >
            {selectedTab === 'table' && (
                <Table
                    programs={programs}

                    regionLevel={regionLevel}
                    onRegionLevelChange={setRegionLevel}

                    indicators={selectedIndicators}
                    onIndicatorsChange={setSelectedIndicators}

                    indicatorList={indicatorList}
                    indicatorListPending={indicatorListPending}
                />
            )}
            {selectedTab === 'charts' && (
                <Charts
                    programs={programs}
                    regionLevel={regionLevel}
                    onRegionLevelChange={setRegionLevel}

                    indicatorList={indicatorList}
                    indicatorListPending={indicatorListPending}
                />
            )}
            {selectedTab === 'sankey' && (
                <Sankey
                    programs={programs}
                    regions={selectedRegions}
                    onRegionsChange={setSelectedRegions}
                />
            )}
        </PopupPage>
    );
}

export default RegionDetails;
