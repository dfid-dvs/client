import { useCallback, useState } from 'react';

export default function useBasicToggle() {
    const [value, setValues] = useState(false);

    const setAction = useCallback(() => {
        setValues(true);
    }, []);

    const toggleAction = useCallback(() => {
        setValues(item => !item);
    }, []);

    const resetAction = useCallback(() => {
        setValues(false);
    }, []);

    return [value, setAction, resetAction, toggleAction] as const;
}
