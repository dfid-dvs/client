import React from 'react';
import { MdOpenInNew } from 'react-icons/md';

import styles from './styles.css';

interface ExternalLinkProps {
    label: string | number;
    link: string | undefined;
}

function ExternalLink({
    link,
    label,
}: ExternalLinkProps) {
    return (
        <a
            href={link}
            className={styles.externalLink}
            target="_blank"
            rel="noopener noreferrer"
        >
            <MdOpenInNew className={styles.icon} />
            <div className={styles.label}>
                { label }
            </div>
        </a>
    );
}

export default ExternalLink;
