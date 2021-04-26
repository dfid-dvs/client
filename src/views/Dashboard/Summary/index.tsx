import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { MdInfoOutline } from 'react-icons/md';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';

import useRequest from '#hooks/useRequest';

import { prepareUrlParams as p } from '#utils/common';
import { apiEndPoint } from '#utils/constants';

import styles from './styles.css';
import SummaryItem from './SummaryItem';

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
    markerIdList?: string[];
    submarkerIdList?: string[];
    programIdList?: string[];
    componentIdList?: string[];
    partnerIdList?: string[];
    sectorIdList?: string[];
    subsectorIdList?: string[];
}

function Summary(props: SummaryProps) {
    const {
        className,
        markerIdList,
        submarkerIdList,
        programIdList,
        componentIdList,
        partnerIdList,
        sectorIdList,
        subsectorIdList,
    } = props;

    const summaryParams = p({
        // eslint-disable-next-line camelcase
        marker_category_id: markerIdList,
        // eslint-disable-next-line camelcase
        marker_value_id: submarkerIdList,
        // eslint-disable-next-line camelcase
        program_id: programIdList,
        // eslint-disable-next-line camelcase
        component_code: componentIdList,
        // eslint-disable-next-line camelcase
        supplier_id: partnerIdList,
        // eslint-disable-next-line camelcase
        sector_id: sectorIdList,
        // eslint-disable-next-line camelcase
        sub_sector_id: subsectorIdList,
    });

    const summaryUrl = summaryParams ? `${apiEndPoint}/core/summary/?${summaryParams}` : `${apiEndPoint}/core/summary/`;
    const [
        summaryPending,
        summary,
    ] = useRequest<SummaryInfo>(summaryUrl, 'fivew-summary');

    const info = 'Summary';
    return (
        <div className={_cs(styles.summary, className)}>
            {summaryPending && (
                <Backdrop>
                    <LoadingAnimation />
                </Backdrop>
            )}
            <div className={styles.info}>
                <MdInfoOutline fontSize={18} />
                <em>
                    {info}
                </em>
            </div>
            <SummaryItem
                className={styles.summaryItem}
                label="Budget Spend (£)"
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
