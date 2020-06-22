import { useState, useEffect } from 'react';
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
): [boolean, T | undefined] {
    const [response, setResponse] = useState<T>();
    const [pending, setPending] = useState(!!url);

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
                setResponse(undefined);
                setPending(false);
                return () => {};
            }

            if (!preserveResponse) {
                setResponse(undefined);
            }
            setPending(true);

            const controller = new AbortController();

            async function fetchResource(myUrl: string, myOptions: RequestInit | undefined) {
                const { signal } = controller;

                let res;
                try {
                    res = await fetch(myUrl, { ...myOptions, signal });
                } catch (e) {
                    setPending(false);
                    if (!signal.aborted) {
                        console.error(`An error occured while fetching ${myUrl}`, e);
                    } else {
                        setResponse(undefined);
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
                    setResponse(undefined);
                    setPending(false);
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
                    setResponse(resBody);
                    setPending(false);
                }
            }

            fetchResource(url, options);

            return () => {
                setPending(false);
                controller.abort();
            };
        },
        [url, options, schemaName, preserveResponse],
    );

    return [pending, response];
}
export default useRequest;
