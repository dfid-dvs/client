import React, { useState, useCallback } from 'react';

import britishEmbassyKathmanduLogo from '#resources/dfid-off-logo.jpg';
import TextInput from '#components/TextInput';
import Button from '#components/Button';
import useStoredState from '#hooks/useStoredState';

import Multiplexer from './Multiplexer';
import styles from './styles.css';

const authEnabled = process.env.REACT_APP_DISABLE_LOGIN !== 'true';
// console.log('auth', authEnabled, process.env.REACT_APP_DISABLE_LOGIN);

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
        'bek-login',
        'false',
    );
    const [password, setPassword] = useState('');
    const [administrator, setAdministrator] = useStoredState<string>(
        'bek-admin',
        'false',
    );
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
            const isNormalUser = hash === '576a560ad73e072c544f08a2f45575d851f48fd80ffd04272d151374b024a6ee';

            const success = isAdminUser || isNormalUser;
            if (success) {
                setLoggedIn('true');
                setAdministrator(String(isAdminUser));
                setPassword('');
            } else {
                setError('Password is not valid!');
            }
        },
        [password, setLoggedIn, setAdministrator],
    );
    const handleLogout = useCallback(
        () => {
            setLoggedIn('false');
            setAdministrator('false');
        },
        [setLoggedIn, setAdministrator],
    );

    const administratorTrued = administrator === 'true';

    if (authEnabled && loggedIn !== 'true') {
        return (
            <div className={styles.passwordPrompt}>
                <div className={styles.navbar}>
                    <img
                        className={styles.logo}
                        src={britishEmbassyKathmanduLogo}
                        alt="British-Embassy-Kathmandu"
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
                            variant="secondary"
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
            administrator={administratorTrued}
        />
    );
}
export default App;
