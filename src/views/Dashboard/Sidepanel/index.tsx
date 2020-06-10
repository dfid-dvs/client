import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import {
    IoIosArrowForward,
    IoIosArrowBack,
} from 'react-icons/io';

import Button from '#components/Button';
import DomainContext from '#components/DomainContext';
import LastUpdated from '#components/LastUpdated';

import useHash from '#hooks/useHash';
import useRequest from '#hooks/useRequest';

import { Indicator } from '#types';
import { apiEndPoint } from '#utils/constants';

import { FiveW } from '../types';
import ProgramWiseTable from './ProgramWiseTable';
import RegionWiseTable from './RegionWiseTable';
import SummaryOutput from './SummaryOutput';
import ExternalLink from './ExternalLink';

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

interface Props {
    className?: string;
    fiveWList: FiveW[];
    indicatorList?: Indicator[];
}

function Sidepanel(props: Props) {
    const {
        className,
        fiveWList,
        indicatorList,
    } = props;

    const { covidMode, programs } = useContext(DomainContext);

    const [isHidden, setIsHidden] = React.useState(false);

    const hash = useHash();

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

    const handleToggleVisibilityButtonClick = React.useCallback(() => {
        setIsHidden(prevValue => !prevValue);
    }, []);

    return (
        <>
            <div className={_cs(
                className,
                styles.sidepanel,
                isHidden && styles.hidden,
            )}
            >
                <Button
                    className={styles.toggleVisibilityButton}
                    onClick={handleToggleVisibilityButtonClick}
                    icons={isHidden ? <IoIosArrowBack /> : <IoIosArrowForward />}
                    transparent
                />
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
                                    className={styles.summaryOutput}
                                    label="Tests performed"
                                    value={status?.tested_total}
                                />
                                <SummaryOutput
                                    className={styles.summaryOutput}
                                    label="Tested positive"
                                    value={status?.tested_positive}
                                />
                                <SummaryOutput
                                    className={styles.summaryOutput}
                                    label="Tested negative"
                                    value={status?.tested_negative}
                                />
                                <SummaryOutput
                                    className={styles.summaryOutput}
                                    label="In isolation"
                                    value={status?.in_isolation}
                                />
                                <SummaryOutput
                                    className={styles.summaryOutput}
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
                                className={styles.summaryOutput}
                                label="Provinces"
                                value={7}
                            />
                            <SummaryOutput
                                className={styles.summaryOutput}
                                label="Districts"
                                value={77}
                            />
                            <SummaryOutput
                                className={styles.summaryOutput}
                                label="Municipalities"
                                value={753}
                            />
                            <SummaryOutput
                                className={styles.summaryOutput}
                                label="Total population"
                                value={28940000}
                            />
                            <SummaryOutput
                                className={styles.summaryOutput}
                                label="GDP (USD)"
                                value={29040000000}
                            />
                            <SummaryOutput
                                className={styles.summaryOutput}
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
                                className={styles.summaryOutput}
                                label="Allocated Budget (£)"
                                value={summary?.allocatedBudget}
                            />
                            <SummaryOutput
                                className={styles.summaryOutput}
                                label="Programs"
                                value={summary?.program}
                            />
                            <SummaryOutput
                                className={styles.summaryOutput}
                                label="Components"
                                value={summary?.component}
                            />
                            <SummaryOutput
                                className={styles.summaryOutput}
                                label="Partners (1st tier)"
                                value={summary?.partner}
                            />
                            <SummaryOutput
                                className={styles.summaryOutput}
                                label="Sectors"
                                value={summary?.sector}
                            />
                        </div>
                        <div className={styles.links}>
                            <Link
                                className={styles.link}
                                to="#regions"
                                replace
                            >
                                Go to regions
                            </Link>
                            <Link
                                className={styles.link}
                                to="#programs"
                                replace
                            >
                                Go to programs
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {hash === 'regions' && (
                <RegionWiseTable
                    fiveW={fiveWList}
                    indicatorList={indicatorList}
                />
            )}
            {hash === 'programs' && (
                <ProgramWiseTable />
            )}
        </>
    );
}

export default Sidepanel;
