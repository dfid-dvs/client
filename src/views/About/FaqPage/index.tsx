import React, { useCallback, useState } from 'react';

import styles from './styles.css';
import QAItem from './QAItem';

// TODO: Delete json file and fetch from backend
import qaData from './data.json';

export default function FaqPage() {
    const [qaId, setQAId] = useState<string>();

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

    return (
        <div className={styles.container}>
            <div className={styles.firstSection}>
                <div className={styles.title}>
                    Frequently Asked Questions
                </div>
                <div className={styles.subTitle}>
                    Got a question? We have got answers.
                </div>
            </div>
            <div className={styles.qaSection}>
                {qaData.map(qa => (
                    <QAItem
                        key={qa.id}
                        qa={qa}
                        qaId={qaId}
                        onShowAnswer={onSetQaId}
                        onHideAnswer={onResetQaId}
                    />
                ))}
            </div>
        </div>
    );
}
