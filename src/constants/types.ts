export interface MultiResponse<T> {
    count: number;
    next?: string;
    previous?: string;
    results: T[];
}
