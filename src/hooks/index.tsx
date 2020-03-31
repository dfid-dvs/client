import React from 'react';

import { Response } from '#types';

// eslint-disable-next-line import/prefer-default-export
export function useForm<T>(
    values: T,
    setValues: (value: T) => void,
    // errors: {} = {},
) {
    const handleChange = (e: InputChangeEvent) => {
        const {
            value,
            name,
        } = e;

        if (name) {
            setValues({
                ...values,
                [name]: value,
            });
        }
    };

    const formElement = (name: string) => ({
        name,
        onChange: handleChange,
        value: values[name],
        // error: fieldErrors[name],
    });

    // const nonFieldErrors = [];

    return {
        formElement,
        values,
        // fieldErrors,
        // nonFieldErrors,
    };
}

const defaultResponse = {
    count: 0,
    results: [],
    data: [],
};

export function useRequest<T>(
    url?: string,
    options?: {},
    deps: React.DependencyList = [],
): [boolean, Response<T>] {
    const [response, setResponse] = React.useState<Response<T>>(defaultResponse);
    const [pending, setPending] = React.useState(!!url);

    React.useEffect(() => {
        if (url) {
            fetch(url, options).then((responseFromRequest) => {
                try {
                    responseFromRequest.json().then((data) => {
                        setResponse(data);
                        setPending(false);
                        console.warn(data);
                    });
                } catch (e) {
                    setPending(false);
                    console.error(e);
                }
            });
        }
    }, [url, options]);

    return [pending, response];
}
