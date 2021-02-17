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

interface Summary {
    allocatedBudget: number;
    program: number;
    partner: number;
    component: number;
    sector: number;
}

interface SummaryProps {
    className?: string;
}

function Summary(props: SummaryProps) {
    const {
        className,
    } = props;

    const { programs } = useContext(DomainContext);

    const summaryParams = p({
        // eslint-disable-next-line @typescript-eslint/camelcase
        program_id: programs,
    });

    const summaryUrl = summaryParams
        ? `${apiEndPoint}/core/summary/?${summaryParams}`
        : `${apiEndPoint}/core/summary/`;

    const [
        summaryPending,
        summary,
    ] = useRequest<Summary>(summaryUrl, 'fivew-summary');
    return (
        <div className={styles.summaryContainer}>
            {summaryPending && (
                <Backdrop>
                    <LoadingAnimation />
                </Backdrop>
            )}
            <SummaryItem
                className={styles.summaryItem}
                label="Allocated Budget (£)"
                value={summary?.allocatedBudget}
            />
            <SummaryItem
                className={styles.summaryItem}
                label="Programs"
                value={summary?.program}
            />
            <SummaryItem
                className={styles.summaryItem}
                label="Partners"
                value={summary?.partner}
            />
            <SummaryItem
                className={styles.summaryItem}
                label="Components"
                value={summary?.component}
            />
            <SummaryItem
                className={styles.summaryItem}
                label="Sectors"
                value={summary?.sector}
            />
        </div>
    );
}

export default Summary;
