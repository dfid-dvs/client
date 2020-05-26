import { useState, useCallback } from 'react';
import { listToMap, compareNumber } from '@togglecorp/fujs';

interface OrderStateItem {
    name: string;
    hidden?: boolean;
}

export function useOrderState(keys: OrderStateItem[]) {
    const [ordering, setOrdering] = useState(keys);

    const moveOrderingItem = useCallback(
        (drag: string, drop: string) => {
            const dragPosition = ordering.findIndex(o => o.name === drag);
            const dropPosition = ordering.findIndex(o => o.name === drop);
            if (dragPosition === dropPosition) {
                return;
            }
            if (dragPosition === -1 || dropPosition === -1) {
                console.error('Drag or drop item could not be found');
                return;
            }
            const dragItem = ordering[dragPosition];

            setOrdering((oldOrdering) => {
                const newOrdering = [...oldOrdering];
                if (dragPosition > dropPosition) {
                    newOrdering.splice(dragPosition, 1);
                    newOrdering.splice(dropPosition, 0, dragItem);
                } else {
                    newOrdering.splice(dropPosition + 1, 0, dragItem);
                    newOrdering.splice(dragPosition, 1);
                }
                return newOrdering;
            });
        },
        [ordering],
    );

    const setOrderingItemVisibility = useCallback(
        (itemKey: string, hidden: boolean | undefined) => {
            const itemIndex = ordering.findIndex(o => o.name === itemKey);
            if (itemIndex === -1) {
                console.error('item could not be found');
                return;
            }
            const item = ordering[itemIndex];
            const newItem = {
                ...item,
                hidden,
            };

            setOrdering((oldOrdering) => {
                const newOrdering = [...oldOrdering];
                newOrdering.splice(itemIndex, 1, newItem);
                return newOrdering;
            });
        },
        [ordering],
    );


    return {
        ordering,
        moveOrderingItem,
        setOrderingItemVisibility,
    };
}

interface OrderColumn {
    id: string;
}

function useOrdering<T extends OrderColumn>(
    columns: T[],
    ordering: OrderStateItem[],
) {
    // NOTE: can memoize this
    const mapping = listToMap(
        ordering,
        item => item.name,
        (item, __, index) => ({
            ...item,
            order: index,
        }),
    );

    // NOTE: can memoize this
    return [...columns]
        .filter(foo => !mapping[foo.id]?.hidden)
        .sort((foo, bar) => {
            // FIXME: this can be optimized
            const fooOrder = mapping[foo.id]?.order;
            const barOrder = mapping[bar.id]?.order;
            return compareNumber(fooOrder, barOrder);
        });
}

export default useOrdering;
