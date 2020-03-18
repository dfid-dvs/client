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
