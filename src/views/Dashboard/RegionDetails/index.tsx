import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import SegmentInput from '#components/SegmentInput';
import PopupPage from '#components/PopupPage';
import { Indicator, RegionLevelOption } from '#types';

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
    { key: 'charts', label: 'Charts' },
    { key: 'table', label: 'Table' },
    { key: 'sankey', label: 'Budget Flow' },
];

interface Props {
    className?: string;
    indicatorList: Indicator[] | undefined;
    indicatorListPending: boolean | undefined;
    regionLevel: RegionLevelOption;
    handleRegionLevelChange: (v: RegionLevelOption) => void;
    programs: number[];
}

const optionKeySelector = (item: TabOption) => item.key;
const optionLabelSelector = (item: TabOption) => item.label;

function RegionDetails(props: Props) {
    const {
        className,
        indicatorList,
        indicatorListPending,
        regionLevel,
        handleRegionLevelChange,
        programs,
    } = props;


    const [selectedTab, setSelectedTab] = useState<TabOptionKeys>('charts');

    const [
        selectedRegions,
        setSelectedRegions,
    ] = useState<number[]>([]);

    const [selectedIndicators, setSelectedIndicators] = useState<number[]>([]);

    return (
        <PopupPage
            className={className}
            parentLink="/"
            parentName="dashboard"
            hideArrow
            actionsClassName={styles.actionsClassName}
            actions={(
                <div className={styles.actionContainer}>
                    <div className={styles.tabActions}>
                        <SegmentInput
                            options={tabOptions}
                            optionKeySelector={optionKeySelector}
                            optionLabelSelector={optionLabelSelector}
                            value={selectedTab}
                            onChange={setSelectedTab}
                        />
                    </div>
                    <Link
                        className={styles.link}
                        to="/infographics/"
                        exact
                    >
                        Region Profile
                    </Link>
                </div>
            )}
            headerClassName={styles.header}
        >
            {selectedTab === 'table' && (
                <Table
                    programs={programs}

                    regionLevel={regionLevel}
                    onRegionLevelChange={handleRegionLevelChange}

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
                    onRegionLevelChange={handleRegionLevelChange}

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
