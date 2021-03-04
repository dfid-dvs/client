import React, { useState, useCallback, useRef, useEffect } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props<T> extends Omit<React.HTMLProps<HTMLInputElement>, 'onChange' | 'onBlur'>{
    className?: string;
    onChange: (value: string, name: string, e: React.FormEvent<HTMLInputElement>) => void;
    onBlur?: (name: string, e: React.FormEvent<HTMLInputElement>) => void;
    elementRef?: React.RefObject<HTMLInputElement>;
}

function RawInput<T=string>(props: Props<T>) {
    const {
        className,
        onChange,
        onBlur,
        elementRef,
        value = '',
        ...otherProps
    } = props;

    const timeoutRef = useRef<number | undefined>();
    const [stateValue, setStateValue] = useState(value);

    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        const {
            currentTarget: {
                value: val,
                name,
            },
        } = e;

        setStateValue(val);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
        timeoutRef.current = window.setTimeout(
            () => onChange(
                val,
                name,
                e,
            ),
            500,
        );
    };

    useEffect(
        () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = undefined;
            }
            setStateValue(value);
        },
        [value],
    );

    useEffect(
        () => () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = undefined;
            }
        },
        [],
    );

    const handleBlur = (e: React.FormEvent<HTMLInputElement>) => {
        const {
            currentTarget: {
                name,
            },
        } = e;

        if (onBlur) {
            onBlur(
                name,
                e,
            );
        }
    };
    return (
        <input
            ref={elementRef}
            onChange={handleChange}
            onBlur={onBlur ? handleBlur : undefined}
            className={_cs(className, styles.rawInput)}
            value={stateValue}
            autoComplete="off"
            {...otherProps}
        />
    );
}

export default RawInput;
