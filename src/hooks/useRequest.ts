import { useState, useEffect } from 'react';
import AbortController from 'abort-controller';

const requestOption = {
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
    },
};

function useRequest<T>(
    url?: string,
    options: object = requestOption,
): [boolean, T | undefined] {
    const [response, setResponse] = useState<T>();
    const [pending, setPending] = useState(!!url);
    const [lastUrl, setLastUrl] = useState<string | undefined>();

    useEffect(
        () => {
            if (!url) {
                setLastUrl(undefined);
                return () => {};
            }

            setPending(true);

            const controller = new AbortController();

            async function fetchResource(myUrl: string, myOptions: object | undefined) {
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
        [url, options],
    );

    return [pending, url === lastUrl ? response : undefined];
}
export default useRequest;
