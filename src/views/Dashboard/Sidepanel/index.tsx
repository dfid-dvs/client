import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import {
    IoIosArrowForward,
    IoIosArrowBack,
} from 'react-icons/io';

import List from '#components/List';
import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import Button from '#components/Button';
import DomainContext from '#components/DomainContext';
import LastUpdated from '#components/LastUpdated';

import useRequest from '#hooks/useRequest';

import { prepareUrlParams as p } from '#utils/common';
import { apiEndPoint } from '#utils/constants';
import { MultiResponse } from '#types';

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

interface Item {
    name: string;
    value: number;
}

const summaryNepalKeySelector = (item: Item) => item.name;
const summaryNepalRendererParams = (key: string, item: Item) => ({
    className: styles.summaryOutput,
    label: item.name,
    value: item.value,
});

interface Props {
    className?: string;
    printMode?: boolean;
}

function Sidepanel(props: Props) {
    const {
        className,
        printMode,
    } = props;

    const { covidMode, programs } = useContext(DomainContext);

    const [isHidden, setIsHidden] = React.useState(false);

    const [
        statusPending,
        status,
    ] = useRequest<Status>(covidMode ? 'https://nepalcorona.info/api/v1/data/nepal' : undefined, 'corona-data');

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

    const summaryNepalUrl = `${apiEndPoint}/core/summary-nepal/`;
    const [
        summaryNepalPending,
        summaryNepal,
    ] = useRequest<MultiResponse<Item>>(summaryNepalUrl, 'summary-nepal');

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
                <div className={styles.summary}>
                    {covidMode && (
                        <div className={styles.covidSummary}>
                            {statusPending && (
                                <Backdrop>
                                    <LoadingAnimation />
                                </Backdrop>
                            )}
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
                            {summaryPending && (
                                <Backdrop>
                                    <LoadingAnimation />
                                </Backdrop>
                            )}
                            <List
                                renderer={SummaryOutput}
                                keySelector={summaryNepalKeySelector}
                                rendererParams={summaryNepalRendererParams}
                                data={summaryNepal?.results}
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
                            {summaryPending && (
                                <Backdrop>
                                    <LoadingAnimation />
                                </Backdrop>
                            )}
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
                    </div>
                    {!printMode && (
                        <div className={styles.exploreData}>
                            <header className={styles.header}>
                                <h2 className={styles.heading}>
                                    Explore the data
                                </h2>
                            </header>
                            <div className={styles.actions}>
                                <Link
                                    className={styles.link}
                                    to="#regions"
                                    replace
                                >
                                    By regions
                                </Link>
                                <Link
                                    className={styles.link}
                                    to="#programs"
                                    replace
                                >
                                    By programs
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Sidepanel;
