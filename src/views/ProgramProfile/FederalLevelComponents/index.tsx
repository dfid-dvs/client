import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoMdCheckmarkCircle, IoMdClose } from 'react-icons/io';
import Button from '#components/Button';

import styles from './styles.css';

interface IndicatorProps {
    className?: string;
    federalLevelComponents: string[];
    setFederalLevelComponentsHidden: () => void;
}

export default function FederalLevelComponents(props: IndicatorProps) {
    const {
        className,
        federalLevelComponents,
        setFederalLevelComponentsHidden,
    } = props;

    return (
        <div className={_cs(styles.federalLevelComponents, className)}>
            <div className={styles.heading}>
                <h3 className={styles.header}>
                    Federal Level Components
                </h3>
                <Button
                    onClick={setFederalLevelComponentsHidden}
                    title="Hide Federal Level Components"
                    transparent
                    variant="icon"
                    className={styles.button}
                >
                    <IoMdClose
                        className={styles.hideIcon}
                    />
                </Button>
            </div>
            <div className={styles.componentList}>
                {federalLevelComponents?.map(component => (
                    <div
                        key={component}
                        className={styles.component}
                    >
                        <IoMdCheckmarkCircle className={styles.icon} />
                        <h3 className={styles.value}>
                            {component}
                        </h3>
                    </div>
                ))}
            </div>
        </div>
    );
}
