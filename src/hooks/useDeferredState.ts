import { useState, useCallback, useRef, useEffect } from 'react';

// NOTE: not used
function useDeferredState<T>(defaultValue: T): [T, (value: (val: T) => T) => void] {
    const [state, setState] = useState(defaultValue);
    const timeoutRef = useRef<number | undefined>();
    const setStateDeferred = useCallback(
        (value: (v: T) => T) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = undefined;
            }
            timeoutRef.current = window.setTimeout(
                () => setState(value),
                1000,
            );
        },
        [],
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

    return [state, setStateDeferred];
}
export default useDeferredState;
