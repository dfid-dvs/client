import React, { useCallback } from 'react';

import HeaderCell from '#components/Table/HeaderCell';
import Checkbox from '#components/Checkbox';

import { FilterParameter } from '#components/Table/useFiltering';

interface Props {
    name: string;
    selected?: string;
    handleClick: (name?: string) => void;
    onFilterValueChange: (name: string, value: Omit<FilterParameter, 'id'>) => void;
}

function HeaderWithSelection(props: Props) {
    const {
        name,
        selected,
        handleClick,
        ...others
    } = props;

    console.warn('name', name, selected);

    const onChange = useCallback(
        (val: boolean) => {
            if (val) {
                handleClick(name);
            } else {
                handleClick(undefined);
            }
        },
        [handleClick, name],
    );

    const isSelected = !!(selected && selected === name);

    return (
        <>
            <HeaderCell
                name={name}
                {...others}
            />
            <Checkbox
                onChange={onChange}
                value={isSelected}
            />
        </>
    );
}

export default HeaderWithSelection;
