import React, { useContext, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoMdClose } from 'react-icons/io';

import { SnackBarContext } from '#components/SnackContext';
import Button from '#components/Button';
import styles from './styles.css';

interface Props {
    notification?: {
        icons?: any;
        children?: any;
        actions?: any;
    };
    className?: string;
}
function Snackbar(props: Props) {
    const {
        className,
    } = props;
    const {
        snackBarContents,
        onResetSnackBar,
    } = useContext(SnackBarContext);

    if (!snackBarContents.message || !snackBarContents.severity) {
        return null;
    }

    return (
        <div
            className={_cs(
                styles.notification,
                className,
                styles[snackBarContents.severity],
            )}
        >
            <div className={styles.message}>
                {snackBarContents.message}
            </div>
            <Button
                icons={<IoMdClose className={styles.icon} />}
                className={styles.button}
                onClick={onResetSnackBar}
            />
        </div>
    );
}

export default Snackbar;
