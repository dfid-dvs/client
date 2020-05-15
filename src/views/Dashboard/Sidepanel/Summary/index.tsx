import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import Numeral from '#components/Numeral';

import styles from './styles.css';

interface Props {
    className?: string;
    onRegionSummaryMoreClick: () => void;
    onDFIDSummaryMoreClick: () => void;
}

function SummaryOutput({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className={styles.summaryOutput}>
            <Numeral
                className={styles.value}
                value={value}
                normalize
            />
            <div className={styles.label}>
                { label }
            </div>
        </div>
    );
}

function Summary(props: Props) {
    const {
        className,
        onRegionSummaryMoreClick,
        onDFIDSummaryMoreClick,
    } = props;

    return (
        <div className={_cs(className, styles.summary)}>
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
                        label="Allocated Budget (USD)"
                        value={0}
                    />
                    <SummaryOutput
                        label="Total Beneficiaries"
                        value={0}
                    />
                    <SummaryOutput
                        label="Male Beneficiaries"
                        value={0}
                    />
                    <SummaryOutput
                        label="Female Beneficiaries"
                        value={0}
                    />
                    <SummaryOutput
                        label="Active programs"
                        value={0}
                    />
                    <SummaryOutput
                        label="Active partners"
                        value={0}
                    />
                    <SummaryOutput
                        label="Sectors"
                        value={0}
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
