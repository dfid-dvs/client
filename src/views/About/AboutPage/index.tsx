import React from 'react';
import { IoMdCheckmarkCircleOutline, IoMdDocument } from 'react-icons/io';

import useRequest from '#hooks/useRequest';
import { apiEndPoint } from '#utils/constants';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import aboutUsImage from '#resources/about-us.jpg';

import StatItem from './StatItem';
import styles from './styles.css';
import AboutPageContainer from '../AboutPageContainer';

const listedData = [
    'Development Tracker to explore international development projects funded by the UK government by country and sector',
    'International Development Funding finder tool for funding opportunities by country, sector and organisation type',
    'Research for Development Outputs for outputs from DFID funded research projects and programmes',
];

const contactDetails = [
    {
        title: 'Email',
        value: 'nepal-enquiries@dfid.gov.uk',
    },
    {
        title: 'Tel',
        value: '+977 1 4237100',
    },
    {
        title: 'Fax',
        value: '+977 1 4411789',
    },
];
const name = 'British Embassy Kathmandu';
const address = 'British Embassy\nPO Box 106\nKathmandu, Nepal';
// eslint-disable-next-line max-len
const firstSectionTitle = 'Find out how the UK will respond to opportunities and challenges, what is being achieved for the UK and who we are working with.';
// eslint-disable-next-line max-len
const firstSectionSubTitle = 'The Department for International Development (DFID) closed on 2 September 2020 and merged with the Foreign and Commonwealth Office (FCO) to create the Foreign, Commonwealth and Development Office.';

const articleTitle = 'Following successful elections in late 2017';
// eslint-disable-next-line max-len
const articleDescription = 'Nepal has the potential for higher, inclusive economic growth through the development of hydro-electric power and through sectors like agro-processing, light manufacturing and tourism, which present significant opportunities for UK business, and trade with India and China. This potential is hampered by complex investment rules and processes, costly and unreliable energy supply, poor transport infrastructure, political instability, weak institutions, poor governance and gender disparity. Nepal is highly vulnerable to natural disasters and climate change which can push populations back into poverty, destroy infrastructure and undermine growth. The 2015 earthquakes caused extensive damage and Nepal remains at high risk of a catastrophic earthquake.';

interface AboutUs {
    count: number;
    next?: number;
    previous?: number;
    results: {
        id: number;
        title: string;
        subTitle: string;
        body: string;
    }[];
}

interface Summary {
    allocatedBudget: number;
    program: number;
    partner: number;
    component: number;
    sector: number;
}

interface Manual {
    count: number;
    next?: number;
    previous?: number;
    results: {
        id: number;
        file: string;
    }[];
}

interface ContactUs {
    count: number;
    next?: number;
    previous?: number;
    results: {
        id: number;
        name: string;
        address: string;
        email: string;
        telephone: string;
        fax: string;
    }[];
}

export default function AboutPage() {
    const aboutUsUrl = `${apiEndPoint}/about_us/`;
    const [
        aboutUsPending,
        aboutUsResponse,
    ] = useRequest<AboutUs>(aboutUsUrl, 'about-us');

    const summaryUrl = `${apiEndPoint}/core/summary/`;
    const [
        summaryPending,
        summary,
    ] = useRequest<Summary>(summaryUrl, 'fivew-summary');

    const manualUrl = `${apiEndPoint}/core/manual/`;
    const [
        manualPending,
        manual,
    ] = useRequest<Manual>(manualUrl, 'manual-data');

    const contactUsUrl = `${apiEndPoint}/about_us/contact_us`;
    const [
        contactUsPending,
        contactUsResponse,
    ] = useRequest<ContactUs>(contactUsUrl, '');

    const loading = summaryPending || manualPending || aboutUsPending || contactUsPending;

    const manualLink = manual?.results[0].file;
    const aboutUs = aboutUsResponse?.results[0];
    const contactUs = contactUsResponse?.results[0];

    return (
        <AboutPageContainer>
            <div className={styles.container}>
                <div className={styles.firstSection}>
                    {aboutUs?.title && (
                        <div
                            className={styles.title}
                            dangerouslySetInnerHTML={{ __html: aboutUs.title }}
                        />
                    )}
                    {aboutUs?.subTitle && (
                        <div
                            className={styles.subTitle}
                            dangerouslySetInnerHTML={{ __html: aboutUs.subTitle }}
                        />
                    )}
                </div>
                <a
                    className={styles.manualLink}
                    href={manualLink}
                    rel="noreferrer noopener"
                    target="_blank"
                >
                    <IoMdDocument className={styles.manualIcon} />
                    View Manual
                </a>
                <div className={styles.stats}>
                    {loading && (
                        <Backdrop>
                            <LoadingAnimation />
                        </Backdrop>
                    )}
                    <StatItem
                        value={summary?.allocatedBudget}
                        label="Budget Spend (£)"
                    />
                    <StatItem
                        value={summary?.program}
                        label="Programs"
                    />
                    <StatItem
                        value={summary?.component}
                        label="Components"
                    />
                    <StatItem
                        value={summary?.partner}
                        label="Partners (1st tier)"
                    />
                    <StatItem
                        value={summary?.sector}
                        label="Sectors"
                    />
                </div>
                {aboutUs?.body && (
                    <div
                        className={styles.details}
                        dangerouslySetInnerHTML={{ __html: aboutUs.body }}
                    />
                )}
                <div className={styles.contact}>
                    <div className={styles.left}>
                        Contact us
                    </div>
                    {contactUs && (
                        <div className={styles.right}>
                            <div className={styles.contactDetails}>
                                <div className={styles.name}>
                                    {contactUs.name}
                                </div>
                                <div
                                    className={styles.address}
                                    dangerouslySetInnerHTML={{ __html: contactUs.address }}
                                />
                                <div className={styles.contactItem}>
                                    <div className={styles.contactTitle}>
                                        Email
                                    </div>
                                    {contactUs.email}
                                </div>
                                <div className={styles.contactItem}>
                                    <div className={styles.contactTitle}>
                                        Tel
                                    </div>
                                    {contactUs.telephone}
                                </div>
                                <div className={styles.contactItem}>
                                    <div className={styles.contactTitle}>
                                        Fax
                                    </div>
                                    {contactUs.fax}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AboutPageContainer>
    );
}
