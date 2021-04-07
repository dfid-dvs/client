import React, { useCallback, useState } from 'react';

import { apiEndPoint } from '#utils/constants';
import useRequest from '#hooks/useRequest';
import Backdrop from '#components/Backdrop';
import LoadingAnimation from '#components/LoadingAnimation';

import styles from './styles.css';
import QAItem from './QAItem';
import AboutPageContainer from '../AboutPageContainer';

interface FAQ {
    count: number;
    next?: number;
    previous?: number;
    results: {
        id: number;
        question: string;
        answer: string;
    }[];
}

export default function FaqPage() {
    const [qaId, setQAId] = useState<number>();

    const onSetQaId = useCallback(
        (id) => {
            setQAId(id);
        }, [setQAId],
    );

    const onResetQaId = useCallback(
        () => {
            setQAId(undefined);
        }, [setQAId],
    );

    const faqUrl = `${apiEndPoint}/core/faq/`;

    const [
        faqPending,
        faq,
    ] = useRequest<FAQ>(faqUrl, 'faq');

    const faqList = faq?.results;

    return (
        <AboutPageContainer>
            <div className={styles.container}>
                <div className={styles.firstSection}>
                    <div className={styles.title}>
                        Frequently Asked Questions
                    </div>
                    <div className={styles.subTitle}>
                        Got a question? We have got answers.
                    </div>
                </div>
                {faqPending && (
                    <Backdrop>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                {!faqPending && (
                    <div className={styles.qaSection}>
                        {faqList && faqList.length > 0
                            ? faqList.map(qa => (
                                <QAItem
                                    key={qa.id}
                                    qa={qa}
                                    qaId={qaId}
                                    onShowAnswer={onSetQaId}
                                    onHideAnswer={onResetQaId}
                                />
                            ))
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
