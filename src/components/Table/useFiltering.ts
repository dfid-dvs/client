import { useMemo, useState, useCallback } from 'react';
import { caseInsensitiveSubmatch, isNotDefined, isFalsyString } from '@togglecorp/fujs';

export function useFilterState(defaultValue?: FilterParameter[]) {
    const [filtering, setFiltering] = useState<FilterParameter[] | undefined>(defaultValue);
    const setFilteringItem = useCallback(
        (id: string, value: Omit<FilterParameter, 'id'> | undefined) => {
            setFiltering((oldFiltering = []) => {
                const index = oldFiltering.findIndex(item => item.id === id);
                if (isNotDefined(value)) {
                    const newFiltering = [...oldFiltering];
                    if (index === -1) {
                        console.error('There is some error');
                    } else {
                        newFiltering.splice(index, 1);
                    }
                    return newFiltering;
                }

                const newValue = {
                    ...value,
                    id,
                };
                const newFiltering = [...oldFiltering];

                if (index === -1) {
                    newFiltering.push(newValue);
                } else {
                    newFiltering.splice(index, 1, newValue);
                }
                return newFiltering;
            });
        },
        [],
    );
    const getFilteringItem = useCallback(
        (id: string) => {
            if (!filtering) {
                return undefined;
            }
            return filtering.find(item => item.id === id);
        },
        [filtering],
    );
    return { filtering, setFiltering, setFilteringItem, getFilteringItem };
}

export interface FilterParameter {
    id: string;

    subMatch?: string;

    greaterThanOrEqualTo?: number;
    lessThanOrEqualTo?: number;
}

interface FilterColumn<T> {
    id: string;
    filterValueSelector?: (foo: T) => string | number | undefined;
}

export function useFiltering<T>(
    filterParameters: FilterParameter[] | undefined,
    columns: FilterColumn<T>[],
    data: T[] | undefined,
) {
    if (!filterParameters || filterParameters.length <= 0) {
        return data;
    }
    const filteredData = data?.filter(datum => (
        filterParameters.every((filterParameter) => {
            let test = true;

            const {
                id,
                subMatch,

                greaterThanOrEqualTo,
                lessThanOrEqualTo,
            } = filterParameter;

            // FIXME: this can be optimized
            const column = columns.find(col => col.id === id);
            if (!column?.filterValueSelector) {
                return test;
            }

            const val = column.filterValueSelector(datum);

            if (isNotDefined(val)) {
                test = false;
            } else if (typeof val === 'string') {
                test = isFalsyString(subMatch) || caseInsensitiveSubmatch(val, subMatch);
            } else {
                test = (
                    (isNotDefined(greaterThanOrEqualTo) || val > greaterThanOrEqualTo)
                    && (isNotDefined(lessThanOrEqualTo) || val < lessThanOrEqualTo)
                );
            }
            return test;
        })
    ));
    return filteredData;
}

export default useFiltering;
