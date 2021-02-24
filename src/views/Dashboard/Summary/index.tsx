import React, { useContext } from 'react';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import DomainContext from '#components/DomainContext';

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
}

interface SummaryProps {
    className?: string;
    actions?: React.ReactNode;
}

function Summary(props: SummaryProps) {
    const {
        className,
        actions,
    } = props;

    const { programs } = useContext(DomainContext);

    const summaryParams = p({
        // eslint-disable-next-line @typescript-eslint/camelcase
        program_id: programs,
    });

    const summaryUrl = `${apiEndPoint}/core/summary/`;
    const [
        summaryPending,
        summary,
    ] = useRequest<SummaryInfo>(summaryUrl, 'fivew-summary');

    const summaryUrlWithParams = summaryParams ? `${apiEndPoint}/core/summary/?${summaryParams}` : undefined;
    const [
        paramedSummaryPending,
        paramedSummary,
    ] = useRequest<SummaryInfo>(summaryUrlWithParams, 'fivew-summary');

    return (
        <div className={className}>
            <div
                className={styles.titleContainer}
            >
                <div className={styles.title}>
                    Summary
                </div>
                {actions}
            </div>
            <div className={styles.summaryContainer}>
                {summaryPending && paramedSummaryPending && (
                    <Backdrop>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                <SummaryItem
                    className={styles.summaryItem}
                    label="Allocated Budget (£)"
                    value={paramedSummary?.allocatedBudget}
                    total={summary?.allocatedBudget}
                />
                <SummaryItem
                    className={styles.summaryItem}
                    label="Programs"
                    value={paramedSummary?.program}
                    total={summary?.program}
                />
                <SummaryItem
                    className={styles.summaryItem}
                    label="Partners"
                    value={paramedSummary?.partner}
                    total={summary?.partner}
                />
                <SummaryItem
                    className={styles.summaryItem}
                    label="Components"
                    value={paramedSummary?.component}
                    total={summary?.component}
                />
                <SummaryItem
                    className={styles.summaryItem}
                    label="Sectors"
                    value={paramedSummary?.sector}
                    total={summary?.sector}
                />
            </div>
        </div>
    );
}

export default Summary;
