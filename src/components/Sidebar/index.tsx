import React from 'react';
import { _cs } from '@togglecorp/fujs';
import Logo from '#resources/img/logo-white-01.svg';

import styles from './styles.scss';

interface Props {
    className?: string;
}

class Sidebar extends React.PureComponent<Props> {
    public render() {
        const { className } = this.props;

        return (
            <div className={_cs(className, styles.sidebar)}>
                <img
                    src={Logo}
                    alt="logo"
                    title="logo"
                />
            </div>
        );
    }
}
export default Sidebar;
