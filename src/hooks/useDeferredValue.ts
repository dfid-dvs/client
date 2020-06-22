import { useState, useRef, useEffect } from 'react';

// NOTE: not used
function useDeferredValue<T>(defaultValue: T) {
    const [state, setState] = useState(defaultValue);
    const timeoutRef = useRef<number | undefined>();

    useEffect(
        () => {
            timeoutRef.current = window.setTimeout(
                () => setState(defaultValue),
                200,
            );
            return () => {
                if (timeoutRef.current) {
                    window.clearTimeout(timeoutRef.current);
                    timeoutRef.current = undefined;
                }
            };
        },
        [defaultValue],
    );

    return state;
}
export default useDeferredValue;
