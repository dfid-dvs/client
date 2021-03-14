import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

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
            className={_cs(styles.programDetails, className)}
            parentLink="/"
            parentName="dashboard"
            hideArrow
            actions={(
                <div className={styles.actionContainer}>
                    <div className={styles.dummy} />
                    <SegmentInput
                        options={tabOptions}
                        optionKeySelector={item => item.key}
                        optionLabelSelector={item => item.label}
                        value={selectedTab}
                        onChange={setSelectedTab}
                    />
                    <Link
                        className={styles.programProfileLink}
                        to="/program-profile/"
                    >
                        Create Program Profile
                    </Link>
                </div>
            )}
            headerClassName={styles.header}
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
