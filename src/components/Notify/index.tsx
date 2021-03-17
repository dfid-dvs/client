import React, { useContext } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';
import SnackB, { SnackBarContext } from '#components/SnackContext';

interface Props {
    notification: {
        icons?: any;
        children?: any;
        actions?: any;
    }
}
function Notify(props: Props) {
    const {
        notification,
    } = props;
    const {
        snackBarContents,
        onResetSnackBar
    } = useContext(SnackBarContext);
    console.log({ snackBarContents });
    return (
        <div
            className={styles.notification}
        >
            { notification.icons && (
                <div className={styles.icons}>
                    { notification.icons }
                </div>
            )}
            { notification.children && (
                <div className={styles.children}>
                    { notification.children }
                </div>
            )}
            { notification.actions && (
                <div className={styles.actions}>
                    { notification.actions }
                </div>
            )}
        </div>
    );
}

export default Notify;
