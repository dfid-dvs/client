import React, { ReactNode } from 'react';
import { _cs } from '@togglecorp/fujs';
import { NavLink } from 'react-router-dom';

import styles from './styles.css';
import Footer from '../Footer';

interface AboutProps {
    className?: string;
    children?: ReactNode;
}

interface AboutOption {
    key: string;
    label: string;
}
const aboutOptionList: AboutOption[] = [
    { key: 'about', label: 'About' },
    { key: 'faqs', label: 'FAQs' },
    { key: 'metadata', label: 'Meta Data' },
    { key: 'termsandconditions', label: 'Terms & Conditions' },
    { key: 'feedback', label: 'Feedback' },
];

export default function AboutPageContainer(props: AboutProps) {
    const {
        className,
        children,
    } = props;

    return (
        <div className={_cs(styles.container, className)}>
            <div className={styles.aboutTabs}>
                {aboutOptionList.map(option => (
                    <NavLink
                        exact
                        className={styles.link}
                        activeClassName={styles.active}
                        to={`/${option.key}`}
                        id={option.key}
                        key={option.key}
                    >
                        {option.label}
                    </NavLink>
                ))}
            </div>
            {children}
            <Footer className={styles.footer} />
        </div>
    );
}
