import { useState, useEffect } from 'react';
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
): [boolean, T | undefined] {
    const [response, setResponse] = useState<T>();
    const [pending, setPending] = useState(!!url);
    const [lastUrl, setLastUrl] = useState<string | undefined>();

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
            if (!url) {
                setLastUrl(undefined);
                return () => {};
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
                    setLastUrl(url);
                    setPending(false);
                }
            }

            fetchResource(url, options);

            return () => {
                controller.abort();
            };
        },
        [url, options, schemaName],
    );

    return [pending, url === lastUrl ? response : undefined];
}
export default useRequest;
