import React, { useCallback, useEffect } from 'react';
import { _cs } from '@togglecorp/fujs';
import { AiOutlinePrinter } from 'react-icons/ai';

import Button from '#components/Button';
import styles from './styles.css';

const setPageSize = (cssPageSize: string) => {
    const style = document.createElement('style');
    style.innerHTML = `@page {size: ${cssPageSize}}`;
    document.head.appendChild(style);
};

interface Props {
    className?: string;
    printMode: boolean;
    onPrintModeChange: (printMode: boolean) => void;
    orientation: 'portrait' | 'landscape';
}

function PrintButton(props: Props) {
    const {
        className,
        printMode,
        onPrintModeChange,
        orientation,
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

    useEffect(() => {
        if (orientation === 'portrait') {
            setPageSize('210mm 297mm');
        } else {
            setPageSize('297mm 210mm');
        }
    }, [orientation]);

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
