import { useState, useCallback } from 'react';

export default function useStoredState<T>(key: string, defaultValue: T): [
    T,
    (v: T) => void,
] {
    const [value, setValue] = useState<T>((): T => {
        const val = localStorage.getItem(key);
        return val === null || val === undefined
            ? defaultValue
            : JSON.parse(val) as T;
    });

    const setValueAndStore = useCallback(
        (v: T) => {
            setValue(v);
            localStorage.setItem(key, JSON.stringify(v));
        },
        [key],
    );

    return [value, setValueAndStore];
}
