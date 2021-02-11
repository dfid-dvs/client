import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    Tabs,
    TabList,
    Tab,
    TabPanel,
} from '#components/Tabs';

import styles from './styles.css';

interface AboutProps {
    className?: string;
}

export default function About(props: AboutProps) {
    const {
        className,
    } = props;

    const [activeTab, setActiveTab] = useState<'about' | 'faqs' | 'termsandconditions' | 'feedback'>('about');

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
                    About
                </TabPanel>
                <TabPanel
                    name="faqs"
                    className={styles.faq}
                >
                    FAQS
                </TabPanel>
                <TabPanel
                    name="termsandconditions"
                    className={styles.termsAndConditions}
                >
                    Terms & Conditions
                </TabPanel>
                <TabPanel
                    name="feedback"
                    className={styles.feedback}
                >
                    Feedback
                </TabPanel>
            </Tabs>
        </div>
    );
}
