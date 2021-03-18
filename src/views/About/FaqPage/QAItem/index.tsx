import React, { useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoIosArrowDropdown, IoIosArrowDropup } from 'react-icons/io';

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

    const answerShown = useMemo(() => qa.id === qaId, [qa.id, qaId]);

    const onToggleAnswer = useCallback(
        () => {
            if (answerShown) {
                onHideAnswer();
            } else {
                onShowAnswer(qa.id);
            }
        },
        [qa.id, answerShown, onHideAnswer, onShowAnswer],
    );

    return (
        <div className={_cs(styles.qaItem, className)}>
            <div
                className={styles.questionSection}
                role="presentation"
                onClick={onToggleAnswer}
            >
                <div className={styles.question}>
                    { qa.question }
                </div>
                {answerShown ? (
                    <IoIosArrowDropup
                        className={styles.icon}
                    />
                ) : (
                    <IoIosArrowDropdown
                        className={styles.icon}
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
