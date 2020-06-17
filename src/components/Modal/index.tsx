import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoMdClose } from 'react-icons/io';

import Button from '#components/Button';
import Backdrop from '#components/Backdrop';
import Portal from '#components/Portal';

import styles from './styles.css';

interface Props {
    children?: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    bodyClassName?: string;
    headerClassName?: string;
    footerClassName?: string;
    onClose: () => void;
}

function Modal(props: Props) {
    const {
        header,
        children,
        footer,

        className,
        headerClassName,
        bodyClassName,
        footerClassName,

        onClose,
    } = props;

    return (
        <Portal>
            <Backdrop dark>
                <div
                    className={_cs(
                        className,
                        styles.modal,
                    )}
                >
                    <div className={_cs(styles.modalHeader, headerClassName)}>
                        <div className={styles.titleContainer}>
                            { header }
                        </div>
                        <Button
                            className={styles.closeButton}
                            onClick={onClose}
                            transparent
                            variant="danger"
                            title="Close"
                        >
                            <IoMdClose />
                        </Button>
                    </div>
                    <div className={_cs(styles.modalBody, bodyClassName)}>
                        { children }
                    </div>
                    {footer && (
                        <div className={_cs(styles.modalFooter, footerClassName)}>
                            {footer}
                        </div>
                    )}
                </div>
            </Backdrop>
        </Portal>
    );
}

export default Modal;
