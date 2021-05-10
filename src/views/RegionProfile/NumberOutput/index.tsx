import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoMdClose } from 'react-icons/io';

import Numeral from '#components/Numeral';
import styles from './styles.css';

export default function NumberOutput(props: {
    label: string;
    value: number;
    className?: string;
    onHideData?: (id: string) => void;
    id: string;
    printMode?: boolean;
}) {
    const {
        label,
        value,
        className,
        onHideData,
        id,
        printMode,
    } = props;

    const handleHideData = useCallback(
        () => {
            if (!onHideData) {
                return;
            }
            onHideData(id);
        },
        [id, onHideData],
    );

    return (
        <div
            className={_cs(
                styles.numberOutput,
                className,
            )}
        >
            <div className={styles.label}>
                { label }
                {onHideData && (
                    <IoMdClose
                        className={_cs(
                            styles.icon,
                            printMode && styles.hidden,
                        )}
                        onClick={handleHideData}
                    />
                )}
            </div>
            <Numeral
                className={styles.value}
                value={value}
                normalize
            />
        </div>
    );
}
