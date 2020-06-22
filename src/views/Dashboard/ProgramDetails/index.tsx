import React, { useContext, useState } from 'react';

import DomainContext from '#components/DomainContext';
import SegmentInput from '#components/SegmentInput';
import PopupPage from '#components/PopupPage';

import {
    DomainContextProps,
} from '#types';

import Sankey from './Sankey';
import Table from './Table';
import styles from './styles.css';

type TabOptionKeys = 'table' | 'sankey';
interface TabOption {
    key: TabOptionKeys;
    label: string;
}
const tabOptions: TabOption[] = [
    { key: 'table', label: 'Table' },
    { key: 'sankey', label: 'Sankey' },
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

    const [selectedTab, setSelectedTab] = useState<TabOptionKeys>('table');

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
            {selectedTab === 'sankey' && (
                <Sankey
                    programs={programs}
                />
            )}
            {selectedTab === 'table' && (
                <Table
                    programs={programs}
                />
            )}
        </PopupPage>
    );
}

export default ProgramDetails;
