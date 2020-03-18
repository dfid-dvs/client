export interface InputChangeEvent<T=string|undefined> {
    value: T;
    name: string | undefined;
    originalEvent?: React.FormEvent<HTMLInputElement>;
}

export interface ButtonClickEvent {
    name: string | undefined;
    originalEvent: React.MouseEvent<HTMLButtonElement>;
}
