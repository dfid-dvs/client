import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { ButtonClickEvent } from '#types';

import styles from './styles.css';

export interface Props extends Omit<React.HTMLProps<HTMLButtonElement>, 'onClick'>{
    className?: string;
    onClick: (e: ButtonClickEvent) => void;
    elementRef: React.RefObject<HTMLButtonElement>;
}

function RawButton(props: Props) {
    const {
        className,
        onClick,
        elementRef,
        ...otherProps
    } = props;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const {
            currentTarget: {
                name,
            },
        } = e;

        onClick({
            name,
            originalEvent: e,
        });
    };

    return (
        <button
            ref={elementRef}
            type="button"
            className={_cs(className, styles.rawButton)}
            onClick={onClick ? handleClick : undefined}
            {...otherProps}
        />
    );
}

export default RawButton;
