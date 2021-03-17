import React, { createContext, useState, useCallback } from 'react';

type Severity = 'error' | 'success' | 'info' | 'warning' | undefined;

interface SnackBarContents {
    message: string;
    severity: Severity;
}

interface Props {
    children: React.ReactNode;
}

interface SnackBarContextType {
    snackBarContents: SnackBarContents;
    setSnackBarContents: (content: SnackBarContents) => void;
    onResetSnackBar: () => void;
}

const initialSnackBarContents = {
    message: '',
    severity: undefined,
};

const initialSnackBarContext: SnackBarContextType = {
    snackBarContents: initialSnackBarContents,
    onResetSnackBar: () => { },
    setSnackBarContents: (content: SnackBarContents) => { },
};

export const SnackBarContext = createContext<SnackBarContextType>(initialSnackBarContext);

const SnackBarContextProvider = ({ children }: Props) => {
    const [
        snackBarContents,
        setSnackBarContents,
    ] = useState<SnackBarContents>(initialSnackBarContents);
    const onResetSnackBar = useCallback(
        () => {
            setSnackBarContents(initialSnackBarContents);
        },
        [setSnackBarContents],
    );
    return (
        <SnackBarContext.Provider
            value={{
                snackBarContents,
                setSnackBarContents,
                onResetSnackBar,
            }}
        >
            {children}
        </SnackBarContext.Provider>
    );
};

export default SnackBarContextProvider;
