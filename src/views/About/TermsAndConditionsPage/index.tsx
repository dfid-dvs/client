import React from 'react';

import { apiEndPoint } from '#utils/constants';
import useRequest from '#hooks/useRequest';
import Backdrop from '#components/Backdrop';
import LoadingAnimation from '#components/LoadingAnimation';

import styles from './styles.css';
import TermAndConditionItem from './TermAndConditionItem';
import LeftTitleItem from './LeftTitleItem';
import AboutPageContainer from '../AboutPageContainer';

interface TermsAndConditions {
    count: number;
    next?: number;
    previous?: number;
    results: {
        id: number;
        title: string;
        subTitle: string;
    }[];
}

export default function TermsAndConditionsPage() {
    const title = 'Terms and conditions';
    // eslint-disable-next-line max-len
    const subTitle = 'This page and any pages it links to explains GOV.UK’s terms of use. You must agree to these to use GOV.UK.';

    const termsAndConditionURL = `${apiEndPoint}/core/terms-condition/`;

    const [
        termsConditionPending,
        termsAndConditions,
    ] = useRequest<TermsAndConditions>(termsAndConditionURL, 'terms-conditions');

    const termsConditionsList = termsAndConditions?.results;

    return (
        <AboutPageContainer>
            <div className={styles.container}>
                <div className={styles.firstSection}>
                    <div className={styles.title}>
                        {title}
                    </div>
                    <div className={styles.subTitle}>
                        {subTitle}
                    </div>
                </div>
                {termsConditionPending && (
                    <Backdrop>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                {!termsConditionPending && (
                    <div className={styles.tcSection}>
                        {termsConditionsList && termsConditionsList.length > 0
                            ? (
                                <div className={styles.tcContainer}>
                                    <div className={styles.leftSection}>
                                        {termsConditionsList.map(tc => (
                                            <LeftTitleItem
                                                key={tc.id}
                                                title={tc.title}
                                                id={tc.id}
                                            />
                                        ))}
                                    </div>
                                    <div className={styles.rightSection}>
                                        {termsConditionsList.map(tc => (
                                            <TermAndConditionItem
                                                key={tc.id}
                                                tc={tc}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )
                            : (
                                <div className={styles.comingSoon}>
                                    Coming soon
                                </div>
                            )
                        }
                    </div>
                )}
            </div>
        </AboutPageContainer>
    );
}
