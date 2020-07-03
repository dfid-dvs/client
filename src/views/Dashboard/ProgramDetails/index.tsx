import React, { useContext, useState } from 'react';

import DomainContext from '#components/DomainContext';
import SegmentInput from '#components/SegmentInput';
import PopupPage from '#components/PopupPage';

import { DomainContextProps } from '#types';

import Table from './Table';
import Sankey from './Sankey';
import Charts from './Charts';

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
}
function ProgramDetails(props: Props) {
    const {
        className,
    } = props;

    const {
        programs,
    } = useContext<DomainContextProps>(DomainContext);

    const [selectedTab, setSelectedTab] = useState<TabOptionKeys>('charts');

    return (
        <PopupPage
            className={className}
            title="Programs"
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
                <Table programs={programs} />
            )}
            {selectedTab === 'charts' && (
                <Charts
                    programs={programs}
                />
            )}
            {selectedTab === 'sankey' && (
                <Sankey
                    programs={programs}
                />
            )}
        </PopupPage>
    );
}

export default ProgramDetails;
