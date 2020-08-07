import React, { useState, useCallback } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import dfidLogo from '#resources/dfid-logo.png';
import TextInput from '#components/TextInput';
import Button from '#components/Button';

import Multiplexer from './Multiplexer';

import '../../../node_modules/mapbox-gl/dist/mapbox-gl.css';
import styles from './styles.css';

// eslint-disable-next-line import/prefer-default-export
export function useStoredState<T>(key: string, defaultValue: T): [
    T,
    (v: T) => void,
] {
    const [value, setValue] = useState<T>((): T => {
        const val = localStorage.getItem(key);
        return val === null || value === undefined
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

async function digestMessage(message: string) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    return hashHex;
}

function App() {
    const [loggedIn, setLoggedIn] = useStoredState<string>(
        'dfid-login',
        'false',
    );
    const [password, setPassword] = useState('');
    const [administrator, setAdministrator] = useState(false);
    const [error, setError] = useState('');

    const handlePasswordChange = useCallback(
        (value: string) => {
            setError('');
            setPassword(value);
        },
        [],
    );

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const hash = await digestMessage(password);

            const isAdminUser = hash === 'f950d2713fde71188f307f8e7c5b454d4e98eed6f9880c8579c8333cfc8a9c82';
            const isNormalUser = hash === 'cdfbc2f2ef35a6e7a717e28c916ba861f0c1c9cafb1a3dd6934000c722c2a083';

            const success = isAdminUser || isNormalUser;
            if (success) {
                setLoggedIn('true');
                setAdministrator(isAdminUser);
                setPassword('');
            } else {
                setError('Password is not valid!');
            }
        },
        [password, setLoggedIn],
    );
    const handleLogout = useCallback(
        () => {
            setLoggedIn('false');
        },
        [setLoggedIn],
    );

    if (process.env.NODE_ENV !== 'development' && loggedIn !== 'true') {
        return (
            <div className={styles.passwordPrompt}>
                <div className={styles.navbar}>
                    <img
                        className={styles.logo}
                        src={dfidLogo}
                        alt="DFID"
                    />
                </div>
                <div className={styles.content}>
                    <form
                        className={styles.loginCard}
                        onSubmit={handleSubmit}
                    >
                        <h3 className={styles.heading}>
                            Login to DVS Nepal
                        </h3>
                        {error && (
                            <div>
                                {error}
                            </div>
                        )}
                        <TextInput
                            label="Password"
                            type="password"
                            autoFocus
                            value={password}
                            onChange={handlePasswordChange}
                        />
                        <Button
                            className={styles.loginButton}
                            disabled={!password}
                            variant="primary"
                            type="submit"
                        >
                            Submit
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <Multiplexer
            onLogout={handleLogout}
            administrator={administrator}
        />
    );
}
export default App;
