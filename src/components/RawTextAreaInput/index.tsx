import React, { useState, useCallback, useRef, useEffect } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props<T> extends Omit<React.HTMLProps<HTMLTextAreaElement>, 'onChange' | 'onBlur'>{
    className?: string;
    onChange: (value: string, name: string, e: React.FormEvent<HTMLTextAreaElement>) => void;
    onBlur?: (name: string, e: React.FormEvent<HTMLTextAreaElement>) => void;
    elementRef?: React.RefObject<HTMLTextAreaElement> | null;
}

function RawTextAreaInput<T=string>(props: Props<T>) {
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

    const handleChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
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

    const handleBlur = (e: React.FormEvent<HTMLTextAreaElement>) => {
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
        <textarea
            ref={elementRef}
            onChange={handleChange}
            onBlur={onBlur ? handleBlur : undefined}
            className={_cs(className, styles.rawTextAreaInput)}
            value={stateValue}
            {...otherProps}
        />
    );
}

export default RawTextAreaInput;
