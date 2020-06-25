import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { getFloatPlacement } from '#utils/common';

import styles from './styles.css';

interface Props {
    className?: string;
    parentRef: React.RefObject<HTMLElement>;
    // forwardedRef: React.RefObject<HTMLDivElement>;
    children: React.ReactNode;
}

const Dropdown = React.forwardRef<HTMLDivElement, Props>(
    (props, ref) => {
        const {
            parentRef,
            children,
            // forwardedRef,
            className,
        } = props;

        const style = getFloatPlacement(parentRef);

        return (
            <div
                ref={ref}
                style={style}
                className={_cs(styles.dropdownContainer, className)}
            >
                { children }
            </div>
        );
    },
);
export default Dropdown;
