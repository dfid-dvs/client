import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props {
    className?: string;
    parentRef?: React.RefObject<HTMLButtonElement>;
}


function Backdrop(props: Props) {
    const {
        className,
        parentRef,
    } = props;

    const ref = React.useRef(null);

    React.useLayoutEffect(() => {
        if (parentRef && parentRef.current && ref.current) {
            const parentBCR = parentRef.current.getBoundingClientRect();
            const el = ref.current as HTMLElement;
            if (el) {
                el.style.width = `${parentBCR.width}px`;
            }
        }
    }, [parentRef]);

    return (
        <div
            ref={ref}
            className={_cs(className, styles.backdrop)}
        />
    );
}

export default Backdrop;
