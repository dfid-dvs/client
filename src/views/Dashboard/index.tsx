import React from 'react';

import Message from '#rscv/Message';
import Sidebar from '#components/Sidebar';

import styles from './styles.scss';

interface State {}
interface Props {}

// eslint-disable-next-line react/prefer-stateless-function
class Dashboard extends React.PureComponent<Props, State> {
    public render() {
        return (
            <div className={styles.dashboard}>
                <Sidebar className={styles.sidebar} />
            </div>
        );
    }
}

export default Dashboard;
