import { useState, useEffect, useRef, useCallback } from 'react';
import { isFalsyString } from '@togglecorp/fujs';
import AbortController from 'abort-controller';

import schema from '../schema';

const requestOption: RequestInit = {
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
    },
};

function useRequest<T>(
    url: string | undefined,
    schemaName: string,
    options: RequestInit = requestOption,
    preserveResponse = true,
    // debug = false,
): [boolean, T | undefined] {
    const [response, setResponse] = useState<T>();
    const [pending, setPending] = useState(!!url);

    const clientIdRef = useRef<number>(-1);
    const pendingSetByRef = useRef<number>(-1);
    const responseSetByRef = useRef<number>(-1);

    const setPendingSafe = useCallback(
        (value: boolean, clientId) => {
            if (clientId >= pendingSetByRef.current) {
                pendingSetByRef.current = clientId;
                /*
                if (debug) {
                    console.warn('setting pending', value, 'by client', clientId);
                }
                */
                setPending(value);
            }
        },
        [],
    );
    const setResponseSafe = useCallback(
        (value: T, clientId) => {
            if (clientId >= responseSetByRef.current) {
                responseSetByRef.current = clientId;
                /*
                if (debug) {
                    console.warn('setting response', value, 'by client', clientId);
                }
                */
                setResponse(value);
            }
        },
        [],
    );

    // NOTE: for warning only
    useEffect(
        () => {
            if (url && options.method !== 'DELETE' && !schemaName) {
                console.error(`Schema is not defined for ${url} ${options.method}`);
            }
        },
        [url, options.method, schemaName],
    );

    useEffect(
        () => {
            if (isFalsyString(url)) {
                setResponseSafe(undefined, clientIdRef.current);
                setPendingSafe(false, clientIdRef.current);
                return () => {};
            }
            if (!preserveResponse) {
                setResponseSafe(undefined, clientIdRef.current);
            }

            // console.warn('Creating new request', url);
            clientIdRef.current += 1;

            setPendingSafe(true, clientIdRef.current);

            const controller = new AbortController();

            async function fetchResource(
                myUrl: string,
                myOptions: RequestInit | undefined,
                clientId: number,
            ) {
                const { signal } = controller;

                let res;
                try {
                    res = await fetch(myUrl, { ...myOptions, signal });
                } catch (e) {
                    // console.warn('Errored fetch', url);
                    setPendingSafe(false, clientId);

                    if (!signal.aborted) {
                        console.error(`An error occured while fetching ${myUrl}`, e);
                        setResponseSafe(undefined, clientId);
                    } else {
                        // console.warn('Clearing response on network error');
                    }
                    return;
                }

                let resBody;
                try {
                    const resText = await res.text();
                    if (resText.length > 0) {
                        resBody = JSON.parse(resText);
                    }
                } catch (e) {
                    // console.warn('Clearing response on parse error');
                    setResponseSafe(undefined, clientId);
                    setPendingSafe(false, clientId);
                    console.error(`An error occured while parsing data from ${myUrl}`, e);
                    return;
                }

                if (res.ok) {
                    if (schemaName && options.method !== 'DELETE') {
                        try {
                            schema.validate(resBody, schemaName);
                        } catch (e) {
                            console.error(url, options.method, resBody, e.message);
                        }
                    }
                    setResponseSafe(resBody, clientId);
                    setPendingSafe(false, clientId);
                }
            }

            fetchResource(url, options, clientIdRef.current);

            return () => {
                controller.abort();
            };
        },
        [url, options, schemaName, preserveResponse, setPendingSafe, setResponseSafe],
    );

    return [pending, response];
}
export default useRequest;
