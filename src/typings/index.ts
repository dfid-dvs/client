export interface InputChangeEvent<T=string|undefined> {
    value: T;
    name: string | undefined;
    originalEvent?: React.FormEvent<HTMLInputElement>;
}
