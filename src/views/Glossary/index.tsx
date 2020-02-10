import React from 'react';


import Message from '#rscv/Message';
import styles from './styles.scss';

interface State {}
interface Props {}

// eslint-disable-next-line react/prefer-stateless-function
class Glossary extends React.PureComponent<Props, State> {
    public render() {
        return (
            <div className={styles.glossary}>
                <div className={styles.mainContent}>
                    <Message className={styles.message}>
                        Glossary
                    </Message>
                </div>
            </div>
        );
    }
}

export default Glossary;
