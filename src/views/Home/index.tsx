import React from 'react';

import Message from '#rscv/Message';

import styles from './styles.scss';

interface State {}
interface Props {}

// eslint-disable-next-line react/prefer-stateless-function
class Home extends React.PureComponent<Props, State> {
    public render() {
        return (
            <div className={styles.home}>
                <Message className={styles.message}>
                    Home
                </Message>
            </div>
        );
    }
}

export default Home;
