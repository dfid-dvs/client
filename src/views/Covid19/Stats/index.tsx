import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { MdOpenInNew } from 'react-icons/md';

import Backdrop from '#components/Backdrop';
import LoadingAnimation from '#components/LoadingAnimation';

import Numeral from '#components/Numeral';
import LastUpdated from '#components/LastUpdated';

import useRequest from '#hooks/useRequest';

import styles from './styles.css';

interface StatOutputProps {
    label: string | number;
    value: number | undefined;
}
const StatOutput = ({
    label,
    value,
}: StatOutputProps) => (
    <div className={styles.statOutput}>
        <div className={styles.value}>
            <Numeral
                value={value}
                precision={0}
                separatorShown
            />
        </div>
        <div className={styles.label}>
            { label }
        </div>
    </div>
);

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

interface Props {
    className?: string;
}

function Stats(props: Props) {
    const { className } = props;

    const [
        statusPending,
        status,
    ] = useRequest<Status>('https://nepalcorona.info/api/v1/data/nepal', 'corona-data');

    return (
        <div className={_cs(className, styles.stats)}>
            <h4 className={styles.heading}>
                COVID-19 Summary
                <LastUpdated date={status?.updated_at} />
            </h4>
            { statusPending && (
                <Backdrop>
                    <LoadingAnimation />
                </Backdrop>
            )}
            <div className={styles.content}>
                <StatOutput
                    label="Tests performed"
                    value={status?.tested_total}
                />
                <StatOutput
                    label="Tested positive"
                    value={status?.tested_positive}
                />
                <StatOutput
                    label="Tested negative"
                    value={status?.tested_negative}
                />
                <StatOutput
                    label="In isolation"
                    value={status?.in_isolation}
                />
                <StatOutput
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
    );
}

export default Stats;
