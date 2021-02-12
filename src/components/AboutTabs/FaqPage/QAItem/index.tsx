import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoIosArrowDropdown, IoIosArrowDropup, IoIosArrowDropupCircle } from 'react-icons/io';

import styles from './styles.css';

interface QA {
    question: string;
    answer: string;
    id: string;
}

interface QAItemProps {
    qa: QA;
    className?: string;
    qaId?: string;
    onShowAnswer: (id: string) => void;
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

    const onViewAnswer = useCallback(
        () => {
            onShowAnswer(qa.id);
        }, [onShowAnswer, qa.id],
    );

    const answerShown = qa.id === qaId;
    return (
        <div className={_cs(styles.qaItem, className)}>
            <div className={styles.questionSection}>
                <div className={styles.question}>
                    { qa.question }
                </div>
                {answerShown ? (
                    <IoIosArrowDropup
                        className={styles.icon}
                        onClick={onHideAnswer}
                    />
                ) : (
                    <IoIosArrowDropdown
                        className={styles.icon}
                        onClick={onViewAnswer}
                    />
                )}
            </div>
            {answerShown && (
                <div className={styles.answer}>
                    { qa.answer }
                </div>
            )}
        </div>
    );
}
