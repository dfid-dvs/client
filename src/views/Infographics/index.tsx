import React from 'react';

import Message from '#rscv/Message';

import styles from './styles.scss';

interface State {}
interface Props {}

// eslint-disable-next-line react/prefer-stateless-function
class Infographics extends React.PureComponent<Props, State> {
    public render() {
        return (
            <div className={styles.infographics}>
                <Message className={styles.message}>
                    Infographics
                </Message>
            </div>
        );
    }
}

export default Infographics;
