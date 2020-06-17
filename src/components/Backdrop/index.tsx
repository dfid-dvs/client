import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props {
    className?: string;
    parentRef?: React.RefObject<HTMLButtonElement>;
    children?: React.ReactNode;
    dark?: boolean;
}

function Backdrop(props: Props) {
    const {
        className,
        parentRef,
        children,
        dark,
    } = props;

    const ref = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(
        () => {
            const {
                current: el,
            } = ref;
            if (parentRef && parentRef.current && el) {
                const parentBCR = parentRef.current.getBoundingClientRect();
                el.style.width = `${parentBCR.width}px`;
            }
        },
        [parentRef],
    );

    return (
        <div
            ref={ref}
            className={_cs(
                className,
                styles.backdrop,
                dark && styles.dark,
            )}
        >
            { children }
        </div>
    );
}

export default Backdrop;
