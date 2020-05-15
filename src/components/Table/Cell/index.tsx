import React from 'react';

import { typedMemo } from '#utils/common';

interface CellProps<T>{
    className?: string;
    value: T;
}

function Cell<T>(props: CellProps<T>) {
    const {
        className,
        value,
    } = props;
    return (
        <div className={className}>
            {value}
        </div>
    );
}

export default typedMemo(Cell);
