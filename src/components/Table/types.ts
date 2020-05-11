export enum SortDirection {
    'asc' = 'Ascending',
    'dsc' = 'Descending',
}
export interface BaseHeader {
    className?: string;
    name: string;

    title?: string;
    sortable?: boolean;

    sortDirection?: SortDirection;
    defaultSortDirection?: SortDirection;
}

export interface BaseCell {
    className?: string;
    name: string;
}
