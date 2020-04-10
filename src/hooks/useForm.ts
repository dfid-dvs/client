function useForm<T, K extends keyof T>(
    values: T,
    setValues: (value: T) => void,
    // errors: {} = {},
) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            currentTarget: { value },
            name,
        } = e;

        if (name) {
            setValues({
                ...values,
                [name]: value,
            });
        }
    };

    const formElement = (name: K) => ({
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

export default useForm;
