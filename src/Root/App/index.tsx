import React, { useState, useCallback } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import dfidLogo from '#resources/DfID-logo.svg';
import TextInput from '#components/TextInput';
import Button from '#components/Button';

import Multiplexer from './Multiplexer';

import '../../../node_modules/mapbox-gl/dist/mapbox-gl.css';
import styles from './styles.css';

// eslint-disable-next-line import/prefer-default-export
export function useStoredState<T extends string>(key: string, defaultValue: T): [
    T,
    (v: T) => void,
] {
    const [value, setValue] = useState<T>(() => {
        const val = localStorage.getItem(key) as T;
        return isNotDefined(val) ? defaultValue : val;
    });

    const setValueAndStore = useCallback(
        (v: T) => {
            setValue(v);
            localStorage.setItem(key, v);
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
    const [loggedIn, setLoggedIn] = useStoredState<string>('dfid-login', 'false');
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
        async () => {
            const hash = await digestMessage(password);

            const isAdminUser = hash === '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
            const isNormalUser = hash === 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446';

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
        [],
    );

    if (loggedIn !== 'true') {
        return (
            <div>
                <img
                    className={styles.logo}
                    src={dfidLogo}
                    alt="DFID"
                />
                <h3>
                    Login to DVS Nepal
                </h3>
                {error && (
                    <div>
                        {error}
                    </div>
                )}
                <TextInput
                    label="Password"
                    autoFocus
                    value={password}
                    onChange={handlePasswordChange}
                />
                <Button
                    disabled={!password}
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
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
