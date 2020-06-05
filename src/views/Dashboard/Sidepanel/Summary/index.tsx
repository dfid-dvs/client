import React, { useContext, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { MdOpenInNew } from 'react-icons/md';

import Button from '#components/Button';
import DomainContext from '#components/DomainContext';
import LastUpdated from '#components/LastUpdated';
import Numeral from '#components/Numeral';

import { apiEndPoint } from '#utils/constants';
import useRequest from '#hooks/useRequest';

import styles from './styles.css';

interface Status {
    tested_positive: number;
    tested_negative: number;
    tested_total: number;
    in_isolation: number;
    pending_result: number;
    recovered: number;
    deaths: 0;
    source: string;
    updated_at: string;
    latest_sit_report: {
        type: string;
        _id: string;
        no: number;
        date: string;
        url: string;
        created_at: string;
        updated_at: string;
        __v: number;
    };
}

interface Summary {
    allocatedBudget: number;
    program: number;
    partner: number;
    component: number;
    sector: number;
}

interface ExternalLinkProps {
    label: string | number;
    link: string | undefined;
}

const ExternalLink = ({
    link,
    label,
}: ExternalLinkProps) => (
    <a
        href={link}
        className={styles.externalLink}
        target="_blank"
        rel="noopener noreferrer"
    >
        <MdOpenInNew className={styles.icon} />
        <div className={styles.label}>
            { label }
        </div>
    </a>
);

function SummaryOutput({
    label,
    value,
}: {
    label: string;
    value: number | undefined;
}) {
    return (
        <div className={styles.summaryOutput}>
            <Numeral
                className={styles.value}
                value={value}
                normalize
                placeholder="-"
            />
            <div className={styles.label}>
                { label }
            </div>
        </div>
    );
}

interface Props {
    className?: string;
    onRegionSummaryMoreClick: () => void;
    onDFIDSummaryMoreClick: () => void;
}

function Summary(props: Props) {
    const {
        className,
        onRegionSummaryMoreClick,
        onDFIDSummaryMoreClick,
    } = props;

    const { covidMode, programs } = useContext(DomainContext);

    const [
        statusPending,
        status,
    ] = useRequest<Status>(covidMode ? 'https://nepalcorona.info/api/v1/data/nepal' : undefined, 'corona-data');

    const summaryUrl = `${apiEndPoint}/core/summary/`;
    const options: RequestInit | undefined = useMemo(
        () => ({
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                programId: programs,
            }),
        }),
        [programs],
    );
    const [
        summaryPending,
        summary,
    ] = useRequest<Summary>(summaryUrl, 'fivew-summary', options);

    return (
        <div className={_cs(className, styles.summary)}>
            {covidMode && (
                <div className={styles.covidSummary}>
                    <header className={styles.header}>
                        <h2 className={styles.heading}>
                            COVID-19 Summary
                        </h2>
                        <LastUpdated date={status?.updated_at} />
                    </header>
                    <div className={styles.content}>
                        <SummaryOutput
                            label="Tests performed"
                            value={status?.tested_total}
                        />
                        <SummaryOutput
                            label="Tested positive"
                            value={status?.tested_positive}
                        />
                        <SummaryOutput
                            label="Tested negative"
                            value={status?.tested_negative}
                        />
                        <SummaryOutput
                            label="In isolation"
                            value={status?.in_isolation}
                        />
                        <SummaryOutput
                            label="Deaths"
                            value={status?.deaths}
                        />
                    </div>
                    <div className={styles.footer}>
                        <ExternalLink
                            link={status?.source}
                            label="Source"
                        />
                        <ExternalLink
                            link={status?.latest_sit_report?.url}
                            label="Latest situation report"
                        />
                    </div>
                </div>
            )}
            <div className={styles.regionSummary}>
                <header className={styles.header}>
                    <h2 className={styles.heading}>
                        About Nepal
                    </h2>
                </header>
                <div className={styles.content}>
                    <SummaryOutput
                        label="Provinces"
                        value={7}
                    />
                    <SummaryOutput
                        label="Districts"
                        value={77}
                    />
                    <SummaryOutput
                        label="Municipalities"
                        value={753}
                    />
                    <SummaryOutput
                        label="Total population"
                        value={28940000}
                    />
                    <SummaryOutput
                        label="GDP (USD)"
                        value={29040000000}
                    />
                    <SummaryOutput
                        label="Per capita income (USD)"
                        value={3110}
                    />
                </div>
            </div>
            <div className={styles.dfidSummary}>
                <header className={styles.header}>
                    <h2 className={styles.heading}>
                        DFID in Nepal
                    </h2>
                </header>
                <div className={styles.content}>
                    <SummaryOutput
                        label="Allocated Budget (£)"
                        value={summary?.allocatedBudget}
                    />
                    <SummaryOutput
                        label="Programs"
                        value={summary?.program}
                    />
                    <SummaryOutput
                        label="Components"
                        value={summary?.component}
                    />
                    <SummaryOutput
                        label="Partners (1st tier)"
                        value={summary?.partner}
                    />
                    <SummaryOutput
                        label="Sectors"
                        value={summary?.sector}
                    />
                </div>
                <div className={styles.links}>
                    <Button
                        className={styles.link}
                        onClick={onRegionSummaryMoreClick}
                    >
                        Go to regions
                    </Button>
                    <Button
                        className={styles.link}
                        onClick={onDFIDSummaryMoreClick}
                    >
                        Go to programs
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Summary;
