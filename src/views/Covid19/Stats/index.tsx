import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { GoLinkExternal } from 'react-icons/go';

import { useRequest } from '#hooks';
import Backdrop from '#components/Backdrop';
import LoadingAnimation from '#components/LoadingAnimation';

import styles from './styles.css';

interface Props {
    className?: string;
}

const StatOutput = ({
    label,
    value,
}) => (
    <div className={styles.statOutput}>
        <div className={styles.value}>
            { value }
        </div>
        <div className={styles.label}>
            { label }
        </div>
    </div>
);

const ExternalLink = ({
    link,
    label,
}) => (
    <a
        href={link}
        className={styles.externalLink}
        target="_blank"
        rel="noopener noreferrer"
    >
        <GoLinkExternal className={styles.icon} />
        <div className={styles.label}>
            { label }
        </div>
    </a>
);


function Stats(props: Props) {
    const { className } = props;

    const [
        statusPending,
        status = {},
    ] = useRequest('https://nepalcorona.info/api/v1/data/nepal');

    return (
        <div className={_cs(className, styles.stats)}>
            <h4 className={styles.heading}>
                COVID-19 summary
            </h4>
            { statusPending && (
                <Backdrop>
                    <LoadingAnimation />
                </Backdrop>
            )}
            <div className={styles.content}>
                <StatOutput
                    label="Tests performed"
                    value={status.tested_total}
                />
                <StatOutput
                    label="Tested positive"
                    value={status.tested_positive}
                />
                <StatOutput
                    label="Tested negative"
                    value={status.tested_negative}
                />
                <StatOutput
                    label="In isolation"
                    value={status.in_isolation}
                />
                <StatOutput
                    label="Deaths"
                    value={status.deaths}
                />
            </div>
            <div className={styles.footer}>
                <ExternalLink
                    link={status.source}
                    label="Source"
                />
                <ExternalLink
                    link={status.latest_sit_report
                        ? status.latest_sit_report.url
                        : undefined
                    }
                    label="Latest situation report"
                />
            </div>
        </div>
    );
}

export default Stats;
