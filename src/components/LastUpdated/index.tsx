import React, { useMemo, memo } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    label?: React.ReactNode;
    labelClassName?: string;
    date?: string;
    dateClassName?: string;
    className?: string;
}

function LastUpdatedDate(props: Props) {
    const {
        date,
        label: labelFromProps,
        dateClassName,
        labelClassName,
        className,
    } = props;

    const label = labelFromProps || 'Last updated on';

    const dateString = useMemo(() => {
        if (!date) {
            return '';
        }
        const dateObj = new Date(date);
        return dateObj.toDateString();
    }, [date]);

    if (!date) {
        return null;
    }

    return (
        <div className={_cs(className, styles.lastUpdatedContainer)}>
            <h3 className={_cs(labelClassName, styles.label)}>
                {label}
            </h3>
            <div className={_cs(styles.date, dateClassName)}>
                {dateString}
            </div>
        </div>
    );
}
export default memo(LastUpdatedDate);
