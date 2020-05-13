import React, { memo } from 'react';

interface CellProps<T>{
    className?: string;
    value: T;
}

function Cell<T>(props: CellProps<T>) {
    const {
        className,
        value,
    } = props;
    console.warn('Rendering cell');
    return (
        <div className={className}>
            {value}
        </div>
    );
}

export default memo(Cell);
