import React from 'react';

import styles from './styles.scss';

// eslint-disable-next-line react/prefer-stateless-function
export default class FourHundredFour extends React.PureComponent {
    render() {
        return (
            <div className={styles.fourHundredFour}>
                <h1 className={styles.heading}>
                    404
                </h1>
                <p className={styles.message}>
                    The page you are looking for does not exist!
                </p>
            </div>
        );
    }
}
