import React from 'react';
import styles from './styles.scss';

// eslint-disable-next-line react/prefer-stateless-function
export default class FourHundredThree extends React.PureComponent {
    render() {
        return (
            <div className={styles.fourHundredThree}>
                <h1 className={styles.heading}>
                    403
                </h1>
                <p className={styles.message}>
                    You do not have enough permissions to view this page.
                </p>
            </div>
        );
    }
}
