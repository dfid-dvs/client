import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { AiOutlinePrinter } from 'react-icons/ai';

import Button from '#components/Button';
import styles from './styles.css';

interface Props {
    className?: string;
    printMode: boolean;
    onPrintModeChange: (printMode: boolean) => void;
}

function PrintButton(props: Props) {
    const {
        className,
        printMode,
        onPrintModeChange,
    } = props;

    const handlePrintPreviewClick = useCallback(() => {
        onPrintModeChange(true);
    }, [onPrintModeChange]);

    const handlePrintPreviewCancelClick = useCallback(() => {
        onPrintModeChange(false);
    }, [onPrintModeChange]);

    const handlePrintClick = useCallback(() => {
        window.print();
    }, []);

    return (
        <div className={_cs(styles.printContainer, className)}>
            {printMode ? (
                <>
                    <Button
                        className={styles.print}
                        onClick={handlePrintClick}
                        icons={<AiOutlinePrinter />}
                        variant="primary"
                    >
                        Print
                    </Button>
                    <Button onClick={handlePrintPreviewCancelClick}>
                        Cancel
                    </Button>
                </>
            ) : (
                <Button
                    className={styles.printPreview}
                    onClick={handlePrintPreviewClick}
                    icons={<AiOutlinePrinter />}
                >
                    Print preview
                </Button>
            )}
        </div>
    );
}

export default PrintButton;
