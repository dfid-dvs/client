import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoIosArrowForward,
    IoIosArrowBack,
} from 'react-icons/io';
// import Stats from './Stats';

import Button from '#components/Button';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Sidepanel(props: Props) {
    const {
        className,
    } = props;

    const [isHidden, setIsHidden] = React.useState(false);
    const handleToggleVisibilityButtonClick = React.useCallback(() => {
        setIsHidden(prevValue => !prevValue);
    }, [setIsHidden]);

    return (
        <div className={_cs(
            className,
            styles.sidepanel,
            isHidden && styles.hidden,
        )}
        >
            <Button
                className={styles.toggleVisibilityButton}
                onClick={handleToggleVisibilityButtonClick}
                icons={isHidden ? <IoIosArrowBack /> : <IoIosArrowForward />}
            />
            This is the sidepanel
        </div>
    );
}

export default Sidepanel;
