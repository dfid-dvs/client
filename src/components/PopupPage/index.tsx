import React from 'react';
import { Link } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    title?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    parentLink: string;
    parentName: string;
    className?: string;
    headerClassName?: string;
    titleClassName?: string;
    actionsClassName?: string;
    contentClassName?: string;
    hideArrow?: boolean;
}

function PopupPage(props: Props) {
    const {
        title = '',
        parentLink,
        parentName,
        actions,
        children,

        className,
        headerClassName,
        titleClassName,
        actionsClassName,
        contentClassName,
        hideArrow = false,
    } = props;
    return (
        <div className={_cs(styles.popupPage, className)}>
            <header className={_cs(styles.header, headerClassName)}>
                {!hideArrow && (
                    <Link
                        className={styles.backButton}
                        to={parentLink}
                        replace
                        title={`Go to ${parentName}`}
                    >
                        <MdArrowBack />
                    </Link>
                )}
                {title && (
                    <h3 className={_cs(styles.heading, titleClassName)}>
                        {title}
                    </h3>
                )}
                <div className={_cs(styles.actions, actionsClassName)}>
                    {actions}
                </div>
            </header>
            <div className={_cs(styles.content, contentClassName)}>
                {children}
            </div>
        </div>
    );
}
export default PopupPage;
