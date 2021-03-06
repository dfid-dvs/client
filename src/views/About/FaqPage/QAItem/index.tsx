import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';

import styles from './styles.css';

interface QA {
    question: string;
    answer: string;
    id: number;
}

interface QAItemProps {
    qa: QA;
    className?: string;
    qaId?: number;
    onShowAnswer: (id: number) => void;
    onHideAnswer: () => void;
}

export default function QAItem(props: QAItemProps) {
    const {
        qa,
        className,
        qaId,
        onShowAnswer,
        onHideAnswer,
    } = props;

    const answerShown = qa.id === qaId;

    const onToggleAnswer = useCallback(
        () => (answerShown ? onHideAnswer() : onShowAnswer(qa.id)),
        [qa.id, answerShown, onHideAnswer, onShowAnswer],
    );

    return (
        <div className={_cs(styles.qaItem, className)}>
            <div
                className={styles.questionSection}
                role="presentation"
                onClick={onToggleAnswer}
            >
                <div
                    className={styles.question}
                    dangerouslySetInnerHTML={{ __html: qa.question }}
                />
                {answerShown ? (
                    <MdArrowDropUp
                        className={styles.icon}
                    />
                ) : (
                    <MdArrowDropDown
                        className={styles.icon}
                    />
                )}
            </div>
            {answerShown && (
                <div
                    className={styles.answer}
                    dangerouslySetInnerHTML={{ __html: qa.answer }}
                />
            )}
        </div>
    );
}
