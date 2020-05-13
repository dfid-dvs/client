import { useMemo, useState } from 'react';

import { SortDirection } from './types';

export function useSortState(defaultValue?: SortParameter) {
    const [sorting, setSorting] = useState<SortParameter | undefined>(defaultValue);
    return { sorting, setSorting };
}

export interface SortParameter {
    name: string;
    direction: SortDirection;
}
interface SortColumn<T> {
    id: string;
    sorter?: (foo: T, bar: T) => number; // FIXME: this is problematic
    defaultSortDirection?: SortDirection;
}

export function useSorting<T>(
    sortParameter: SortParameter | undefined,
    columns: SortColumn<T>[],
    data: T[] | undefined,
) {
    const selectedSorter = useMemo(
        () => {
            const columnToSort = columns.find(column => column.id === sortParameter?.name);
            return columnToSort?.sorter;
        },
        [columns, sortParameter?.name],
    );

    const sortedData = useMemo(
        () => {
            if (!data || !selectedSorter) {
                return data;
            }
            if (sortParameter?.direction === SortDirection.dsc) {
                return [...data].sort(selectedSorter).reverse();
            }
            return [...data].sort(selectedSorter);
        },
        [data, selectedSorter, sortParameter?.direction],
    );

    return sortedData;
}

export default useSorting;
