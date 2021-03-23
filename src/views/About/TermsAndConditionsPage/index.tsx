import React, { useState } from 'react';

import styles from './styles.css';
import TermAndConditionItem from './TermAndConditionItem';
import LeftTitleItem from './LeftTitleItem';

// TODO: Delete json file and fetch from backend
import tcData from './data.json';

export default function TermsAndConditionsPage() {
    const title = 'Terms and conditions';
    // eslint-disable-next-line max-len
    const subTitle = 'This page and any pages it links to explains GOV.UK’s terms of use. You must agree to these to use GOV.UK.';
    return (
        <div className={styles.container}>
            <div className={styles.firstSection}>
                <div className={styles.title}>
                    {title}
                </div>
                <div className={styles.subTitle}>
                    {subTitle}
                </div>
            </div>
            <div className={styles.tcSection}>
                <div className={styles.leftSection}>
                    {tcData.map(tc => (
                        <LeftTitleItem
                            key={tc.id}
                            title={tc.title}
                        />
                    ))}
                </div>
                <div className={styles.rightSection}>
                    {tcData.map(tc => (
                        <TermAndConditionItem
                            key={tc.id}
                            tc={tc}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
