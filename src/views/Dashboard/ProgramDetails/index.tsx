import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { unique, _cs } from '@togglecorp/fujs';

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

    const programIdList = useMemo(
        () => unique(
            programs.filter(item => item.startsWith('program'))
                .map(item => Number(item.split('-')[1])),
        ),
        [programs],
    );

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
                        to="/programme-profile/"
                    >
                        Create Programme Profile
                    </Link>
                </div>
            )}
            headerClassName={styles.header}
        >
            {selectedTab === 'table' && (
                <Table programs={programIdList} />
            )}
            {selectedTab === 'charts' && (
                <Charts
                    programs={programIdList}
                />
            )}
            {selectedTab === 'sankey' && (
                <Sankey
                    programs={programIdList}
                />
            )}
        </PopupPage>
    );
}

export default ProgramDetails;
