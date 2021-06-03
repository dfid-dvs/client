import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { getFloatPlacement } from '#utils/common';

import styles from './styles.css';

interface Props {
    className?: string;
    parentRef: React.RefObject<HTMLElement>;
    elementRef: React.RefObject<HTMLDivElement>;
    children: React.ReactNode;
}

function Dropdown(props: Props) {
    const {
        parentRef,
        children,
        elementRef,
        className,
    } = props;

    const style = getFloatPlacement(parentRef);

    return (
        <div
            ref={elementRef}
            style={style}
            className={_cs(styles.dropdownContainer, className)}
        >
            { children }
        </div>
    );
}
export default Dropdown;
