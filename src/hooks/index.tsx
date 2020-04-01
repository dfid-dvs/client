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
            setPending(true);
            fetch(url, options).then((responseFromRequest) => {
                try {
                    responseFromRequest.json().then((data) => {
                        setResponse(data);
                        setPending(false);
                        // console.warn(data);
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

export function useBlurEffect(
    shouldWatch: boolean,
    callback: (clickedInside: boolean, e: MouseEvent) => void,
    elementRef: React.RefObject<HTMLElement>,
    parentRef: React.RefObject<HTMLElement>,
    deps?: React.DependencyList,
) {
    React.useEffect(() => {
        const handleDocumentClick = (e: MouseEvent) => {
            const { current: element } = elementRef;
            const { current: parent } = parentRef;

            const isElementOrContainedInElement = element
                ? element === e.target || element.contains(e.target as HTMLElement)
                : false;
            const isParentOrContainedInParent = parent
                ? parent === e.target || parent.contains(e.target as HTMLElement)
                : false;

            const clickedInside = isElementOrContainedInElement || isParentOrContainedInParent;
            callback(clickedInside, e);
        };

        if (shouldWatch) {
            document.addEventListener('click', handleDocumentClick);
        } else {
            document.removeEventListener('click', handleDocumentClick);
        }

        return () => { document.removeEventListener('click', handleDocumentClick); };
    }, deps);
}
