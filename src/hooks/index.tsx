import React from 'react';

// eslint-disable-next-line import/prefer-default-export
export function useForm(
    values: {},
    setValues,
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

const schema = {
    results: [{
        id: 'number',
        fullTitle: 'string',
    }],
};

export function useRequest<T>(
    url: string,
    options?: {},
    deps: React.DependencyList = [],
) {
    const [response, setResponse] = React.useState();
    const [pending, setPending] = React.useState(true);

    React.useEffect(() => {
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
    }, [url, options]);

    return [pending, response];
}
