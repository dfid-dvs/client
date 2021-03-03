import React, { useContext } from 'react';
import { _cs } from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import DomainContext from '#components/DomainContext';

import useRequest from '#hooks/useRequest';

import { prepareUrlParams as p } from '#utils/common';
import { apiEndPoint } from '#utils/constants';

import styles from './styles.css';
import SummaryItem from './SummaryItem';
import splitCombinedSelectors from '../splitCombinedSelectors';

interface SummaryInfo {
    allocatedBudget: number;
    program: number;
    partner: number;
    component: number;
    sector: number;
    totalAllocatedBudget: number;
    totalProgram: number;
    totalPartner: number;
    totalComponent: number;
    totalSector: number;
}

interface SummaryProps {
    className?: string;
    actions?: React.ReactNode;
    dataExplored?: boolean;

    markerIdList?: number[];
    submarkerIdList?: number[];
    programIdList?: number[];
    componentIdList?: number[];
    partnerIdList?: number[];
    sectorIdList?: number[];
    subsectorIdList?: number[];
}

function Summary(props: SummaryProps) {
    const {
        className,
        actions,
        dataExplored,

        markerIdList,
        submarkerIdList,
        programIdList,
        componentIdList,
        partnerIdList,
        sectorIdList,
        subsectorIdList,
    } = props;

    const summaryParams = p({
        // eslint-disable-next-line @typescript-eslint/camelcase
        marker_category_id: markerIdList,
        // eslint-disable-next-line @typescript-eslint/camelcase
        marker_value_id: submarkerIdList,
        // eslint-disable-next-line @typescript-eslint/camelcase
        program_id: programIdList,
        // eslint-disable-next-line @typescript-eslint/camelcase
        component_id: componentIdList,
        // eslint-disable-next-line @typescript-eslint/camelcase
        supplier_id: partnerIdList,
        // eslint-disable-next-line @typescript-eslint/camelcase
        sector_id: sectorIdList,
        // eslint-disable-next-line @typescript-eslint/camelcase
        sub_sector_id: subsectorIdList,
    });

    const summaryUrl = summaryParams ? `${apiEndPoint}/core/summary/?${summaryParams}` : `${apiEndPoint}/core/summary/`;

    const [
        summaryPending,
        summary,
    ] = useRequest<SummaryInfo>(summaryUrl, 'fivew-summary');

    return (
        <div className={_cs(styles.summary, className)}>
            {summaryPending && (
                <Backdrop>
                    <LoadingAnimation />
                </Backdrop>
            )}
            <SummaryItem
                className={styles.summaryItem}
                label="Allocated Budget (£)"
                value={summary?.allocatedBudget}
                total={summary?.totalAllocatedBudget}
            />
            <SummaryItem
                className={styles.summaryItem}
                label="Programs"
                value={summary?.program}
                total={summary?.totalProgram}
            />
            <SummaryItem
                className={styles.summaryItem}
                label="Partners"
                value={summary?.partner}
                total={summary?.totalPartner}
            />
            <SummaryItem
                className={styles.summaryItem}
                label="Components"
                value={summary?.component}
                total={summary?.totalComponent}
            />
            <SummaryItem
                className={styles.summaryItem}
                label="Sectors"
                value={summary?.sector}
                total={summary?.totalSector}
            />
        </div>
    );
}

export default Summary;
