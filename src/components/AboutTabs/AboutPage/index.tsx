import React from 'react';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';

import styles from './styles.css';

const stats = [
    {
        title: 'Allocated Budget (£)',
        value: '362.4M',
    },
    {
        title: 'Programs',
        value: '16',
    },
    {
        title: 'Components',
        value: '55',
    },
    {
        title: 'Partners (1st tier)',
        value: '42',
    },
    {
        title: 'Sectors',
        value: '12',
    },
];

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
const name = 'DFID Nepal';
const address = 'British Embassy\nPO Box 106\nKathmandu, Nepal';
// eslint-disable-next-line max-len
const firstSectionTitle = 'Find out how the UK will respond to opportunities and challenges, what is being achieved for the UK and who we are working with.';
// eslint-disable-next-line max-len
const firstSectionSubTitle = 'The Department for International Development (DFID) closed on 2 September 2020 and merged with the Foreign and Commonwealth Office (FCO) to create the Foreign, Commonwealth and Development Office.';

const articleTitle = 'Following successful elections in late 2017';
// eslint-disable-next-line max-len
const articleDescription = 'Nepal has the potential for higher, inclusive economic growth through the development of hydro-electric power and through sectors like agro-processing, light manufacturing and tourism, which present significant opportunities for UK business, and trade with India and China. This potential is hampered by complex investment rules and processes, costly and unreliable energy supply, poor transport infrastructure, political instability, weak institutions, poor governance and gender disparity. Nepal is highly vulnerable to natural disasters and climate change which can push populations back into poverty, destroy infrastructure and undermine growth. The 2015 earthquakes caused extensive damage and Nepal remains at high risk of a catastrophic earthquake.';

export default function AboutPage() {
    return (
        <div className={styles.container}>
            <div className={styles.firstSection}>
                <div className={styles.title}>
                    {firstSectionTitle}
                </div>
                <div className={styles.subTitle}>
                    {firstSectionSubTitle}
                </div>
            </div>
            <div className={styles.stats}>
                {stats.map(stat => (
                    <div
                        key={stat.title}
                        className={styles.statItem}
                    >
                        <div className={styles.value}>
                            {stat.value}
                        </div>
                        <div className={styles.title}>
                            {stat.title}
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.details}>
                <div className={styles.left}>
                    <div className={styles.title}>
                        {articleTitle}
                    </div>
                    <div className={styles.description}>
                        {articleDescription}
                    </div>
                    <div className={styles.list}>
                        {listedData.map(data => (
                            <div
                                key={data}
                                className={styles.listItem}
                            >
                                <IoMdCheckmarkCircleOutline className={styles.checkBox} />
                                <div className={styles.description}>
                                    {data}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.right}>
                    <img
                        src="http://adranepal.org/wp-content/uploads/2020/02/DSC_0506-980x652.jpg"
                        alt="Dfid"
                        className={styles.image}
                    />
                </div>
            </div>
            <div className={styles.contact}>
                <div className={styles.left}>
                    Contact us
                </div>
                <div className={styles.right}>
                    <div className={styles.contactDetails}>
                        <div className={styles.name}>
                            {name}
                        </div>
                        <div className={styles.address}>
                            {address}
                        </div>
                        {contactDetails.map(data => (
                            <div
                                key={data.title}
                                className={styles.contactItem}
                            >
                                <div className={styles.contactTitle}>
                                    {data.title}
                                </div>
                                <div>
                                    {data.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
