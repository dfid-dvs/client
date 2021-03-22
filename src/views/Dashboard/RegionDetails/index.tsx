import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import { Link } from 'react-router-dom';

import SegmentInput from '#components/SegmentInput';
import PopupPage from '#components/PopupPage';
import Label from '#components/Label';
import SingleRegionSelect from '#components/SingleRegionSelect';
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
    onHideFilterButton?: () => void;
    onShowFilterButton?: () => void;
    filterButtonHidden?: boolean;

    markerIdList?: number[];
    submarkerIdList?: number[];
    programIdList?: number[];
    componentIdList?: number[];
    partnerIdList?: number[];
    sectorIdList?: number[];
    subsectorIdList?: number[];

    handleRegionLevelChange?: (regionLvl: RegionLevelOption) => void;
}

const optionKeySelector = (item: TabOption) => item.key;
const optionLabelSelector = (item: TabOption) => item.label;

function RegionDetails(props: Props) {
    const {
        className,
        indicatorList,
        indicatorListPending,
        regionLevel,
        onHideFilterButton,
        onShowFilterButton,
        filterButtonHidden,

        markerIdList,
        submarkerIdList,
        programIdList,
        componentIdList,
        partnerIdList,
        sectorIdList,
        subsectorIdList,
        handleRegionLevelChange,
    } = props;


    const [selectedTab, setSelectedTab] = useState<TabOptionKeys>('charts');

    const onSelectTab = useCallback((tabKey: TabOptionKeys) => {
        setSelectedTab(tabKey);
        if (onHideFilterButton && tabKey === 'sankey') {
            onHideFilterButton();
        }
        if (filterButtonHidden && onShowFilterButton && tabKey !== 'sankey') {
            onShowFilterButton();
        }
    }, [setSelectedTab, onHideFilterButton, filterButtonHidden, onShowFilterButton]);

    const [
        selectedRegions,
        setSelectedRegions,
    ] = useState<number[]>([]);

    const [selectedIndicators, setSelectedIndicators] = useState<number[]>([]);
    const hideRegionSelect = selectedTab === 'sankey';

    return (
        <PopupPage
            className={_cs(styles.regionDetails, className)}
            parentLink="/"
            parentName="dashboard"
            hideArrow
            actions={(
                <div className={styles.actionContainer}>
                    <header
                        className={_cs(
                            styles.regionSelect,
                            hideRegionSelect && styles.hidden,
                        )}
                    >
                        <Label className={styles.label}>
                            View by
                        </Label>
                        <SingleRegionSelect
                            onRegionLevelChange={handleRegionLevelChange}
                            regionLevel={regionLevel}
                            region={undefined}
                        />
                    </header>
                    <div className={styles.midSection}>
                        <div className={styles.dummy} />
                        <SegmentInput
                            options={tabOptions}
                            optionKeySelector={optionKeySelector}
                            optionLabelSelector={optionLabelSelector}
                            value={selectedTab}
                            onChange={onSelectTab}
                        />
                        <Link
                            className={styles.regionProfileLink}
                            to="/region-profile/"
                        >
                            Create Regional Profile
                        </Link>
                    </div>
                </div>
            )}
            headerClassName={styles.header}
            actionsClassName={styles.header}
        >
            {selectedTab === 'table' && (
                <Table
                    regionLevel={regionLevel}

                    indicators={selectedIndicators}
                    onIndicatorsChange={setSelectedIndicators}

                    indicatorList={indicatorList}
                    indicatorListPending={indicatorListPending}

                    markerIdList={markerIdList}
                    submarkerIdList={submarkerIdList}
                    programIdList={programIdList}
                    componentIdList={componentIdList}
                    partnerIdList={partnerIdList}
                    sectorIdList={sectorIdList}
                    subsectorIdList={subsectorIdList}
                />
            )}
            {selectedTab === 'charts' && (
                <Charts
                    regionLevel={regionLevel}

                    indicatorList={indicatorList}
                    indicatorListPending={indicatorListPending}

                    markerIdList={markerIdList}
                    submarkerIdList={submarkerIdList}
                    programIdList={programIdList}
                    componentIdList={componentIdList}
                    partnerIdList={partnerIdList}
                    sectorIdList={sectorIdList}
                    subsectorIdList={subsectorIdList}
                />
            )}
            {selectedTab === 'sankey' && (
                <Sankey
                    programIdList={programIdList}
                    regions={selectedRegions}
                    onRegionsChange={setSelectedRegions}
                />
            )}
        </PopupPage>
    );
}

export default RegionDetails;
