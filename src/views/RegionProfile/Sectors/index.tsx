import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoMdCheckmarkCircle, IoMdClose } from 'react-icons/io';
import Button from '#components/Button';

import styles from './styles.css';

interface IndicatorProps {
    className?: string;
    activeSectors: string[];
    setSectorsHidden: () => void;
}
export default function Sectors(props: IndicatorProps) {
    const {
        className,
        activeSectors,
        setSectorsHidden,
    } = props;

    return (
        <div className={_cs(styles.activeSectors, className)}>
            <div className={styles.heading}>
                <h3 className={styles.header}>
                    Active Sectors
                </h3>
                <Button
                    onClick={setSectorsHidden}
                    title="Hide Sectors"
                    transparent
                    variant="icon"
                    className={styles.button}
                >
                    <IoMdClose
                        className={styles.hideIcon}
                    />
                </Button>
            </div>
            <div className={styles.sectorsList}>
                {activeSectors?.map(sector => (
                    <div
                        key={sector}
                        className={styles.sector}
                    >
                        <IoMdCheckmarkCircle className={styles.icon} />
                        <h3 className={styles.value}>
                            {sector}
                        </h3>
                    </div>
                ))}
            </div>
        </div>
    );
}
