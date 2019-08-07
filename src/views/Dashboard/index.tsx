import React from 'react';

import Message from '#rscv/Message';

import styles from './styles.scss';

interface State {}
interface Props {}

// eslint-disable-next-line react/prefer-stateless-function
class Dashboard extends React.PureComponent<Props, State> {
    public render() {
        return (
            <div className={styles.dashboard}>
                <Message className={styles.message}>
                    Dashboard
                </Message>
            </div>
        );
    }
}

export default Dashboard;
