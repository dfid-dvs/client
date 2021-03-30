import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoMdCheckmarkCircle, IoMdClose } from 'react-icons/io';
import Button from '#components/Button';

import styles from './styles.css';

interface Sector {
    name: string;
    id: number;
    totalBudget: number;
}

interface IndicatorProps {
    className?: string;
    activeSectors: Sector[];
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
                        key={sector.id}
                        className={styles.sector}
                    >
                        <IoMdCheckmarkCircle className={styles.icon} />
                        <h3 className={styles.value}>
                            {sector.name}
                        </h3>
                    </div>
                ))}
            </div>
        </div>
    );
}
