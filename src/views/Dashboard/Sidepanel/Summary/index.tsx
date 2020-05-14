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
                    <h3 className={styles.heading}>
                        Region summary
                    </h3>
                    <Button
                        onClick={onRegionSummaryMoreClick}
                        className={styles.seeMoreButton}
                        transparent
                        variant="primary"
                    >
                        See more
                    </Button>
                </header>
                <div className={styles.content}>
                    <SummaryOutput
                        label="Total population"
                        value={23000000}
                    />
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
                        label="GDP (USD)"
                        value={28910000000}
                    />
                    <SummaryOutput
                        label="Per capita income (USD)"
                        value={1024}
                    />
                </div>
            </div>
            <div className={styles.dfidSummary}>
                <header className={styles.header}>
                    <h3 className={styles.heading}>
                        DFID summary
                    </h3>
                    <Button
                        onClick={onDFIDSummaryMoreClick}
                        className={styles.seeMoreButton}
                        transparent
                        variant="primary"
                    >
                        See more
                    </Button>
                </header>
                <div className={styles.content}>
                    <SummaryOutput
                        label="Spent on active programs (USD)"
                        value={28910000000}
                    />
                    <SummaryOutput
                        label="Active programs"
                        value={20}
                    />
                    <SummaryOutput
                        label="Active partners"
                        value={47}
                    />
                    <SummaryOutput
                        label="Sectors"
                        value={10}
                    />
                </div>
            </div>
        </div>
    );
}

export default Summary;
