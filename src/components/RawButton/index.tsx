import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props extends Omit<React.HTMLProps<HTMLButtonElement>, 'ref' | 'onClick'>{
    className?: string;
    onClick?: (name: string | undefined, e: React.MouseEvent<HTMLButtonElement>) => void;
    type?: 'button' | 'submit' | 'reset';
    elementRef?: React.Ref<HTMLButtonElement>;
}

function RawButton(props: Props) {
    const {
        className,
        onClick,
        elementRef,
        ...otherProps
    } = props;

    const handleClick = React.useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            const {
                currentTarget: {
                    name,
                },
            } = e;

            if (onClick) {
                onClick(
                    name,
                    e,
                );
            }
        },
        [onClick],
    );

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
