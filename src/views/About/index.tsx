import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    Tabs,
    TabList,
    Tab,
    TabPanel,
} from '#components/Tabs';

import AboutPage from './AboutPage';
import FaqPage from './FaqPage';
import Footer from './Footer';
import TermsAndConditionsPage from './TermsAndConditionsPage';
import FeedbackPage from './FeedbackPage';

import styles from './styles.css';

interface AboutProps {
    className?: string;
}

export default function About(props: AboutProps) {
    const {
        className,
    } = props;

    const [activeTab, setActiveTab] = useState<'about' | 'faqs' | 'termsandconditions' | 'feedback'>('feedback');

    return (
        <div className={_cs(styles.aboutTabs, className)}>
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
            >
                <TabList className={styles.tabList}>
                    <Tab name="about">
                        About
                    </Tab>
                    <Tab name="faqs">
                        FAQs
                    </Tab>
                    <Tab name="termsandconditions">
                        Terms & Conditions
                    </Tab>
                    <Tab name="feedback">
                        Feedback
                    </Tab>
                </TabList>
                <TabPanel
                    name="about"
                    className={styles.about}
                >
                    <AboutPage />
                </TabPanel>
                <TabPanel
                    name="faqs"
                    className={styles.faq}
                >
                    <FaqPage />
                </TabPanel>
                <TabPanel
                    name="termsandconditions"
                    className={styles.termsAndConditions}
                >
                    <TermsAndConditionsPage />
                </TabPanel>
                <TabPanel
                    name="feedback"
                    className={styles.feedback}
                >
                    <FeedbackPage />
                </TabPanel>
            </Tabs>
            <Footer className={styles.footer} />
        </div>
    );
}