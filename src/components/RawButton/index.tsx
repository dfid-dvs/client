import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { ButtonClickEvent } from '#types';

import styles from './styles.css';

export interface Props extends Omit<React.HTMLProps<HTMLButtonElement>, 'onClick'>{
    className?: string;
    onClick: (e: ButtonClickEvent) => void;
    // elementRef: React.RefObject<HTMLButtonElement>;
    type?: 'button' | 'submit' | 'reset';
}

function RawButton(props: Props) {
    const {
        className,
        onClick,
        // elementRef,
        ...otherProps
    } = props;

    const handleClick = React.useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            const {
                currentTarget: {
                    name,
                },
            } = e;

            onClick({
                name,
                originalEvent: e,
            });
        },
        [onClick],
    );

    return (
        <button
            // ref={elementRef}
            type="button"
            className={_cs(className, styles.rawButton)}
            onClick={onClick ? handleClick : undefined}
            {...otherProps}
        />
    );
}

export default RawButton;
RawButton.defaultProps = {
    type: 'button',
};
