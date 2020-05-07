import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import Table from '#components/Table';
import HeaderCell from '#components/Table/HeaderCell';
import Cell from '#components/Table/Cell';
import { SortDirection } from '#components/Table/types';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Glossary(props: Props) {
    const { className } = props;

    interface Data {
        order: number;
        name: string;
        age: number;
    }

    const [sorting, setSorting] = useState<{
        name: string;
        direction: SortDirection;
    } | undefined>({ name: 'name', direction: SortDirection.asc });

    const keySelector = (data: Data) => data.order;

    const columns = [
        {
            id: 'order',
            title: 'Order',

            sorter: (foo: Data, bar: Data) => (foo.order - bar.order),

            headerCellRenderer: HeaderCell,
            headerCellRendererParams: {
                onSortChange: setSorting,
            },

            cellRenderer: Cell,
            cellRendererParams: (key: number, datum: Data) => ({
                value: datum.order,
            }),

            cellAsHeader: true,
        },
        {
            id: 'name',
            title: 'Name',

            sorter: (foo: Data, bar: Data) => (foo.name.localeCompare(bar.name)),

            headerCellRenderer: HeaderCell,
            headerCellRendererParams: {
                onSortChange: setSorting,
            },

            cellRenderer: Cell,
            cellRendererParams: (key: number, datum: Data) => ({
                value: datum.name,
            }),
        },
        {
            id: 'age',
            title: 'Age',

            sorter: (foo: Data, bar: Data) => (foo.age - bar.age),

            headerCellRenderer: HeaderCell,
            headerCellRendererParams: {
                onSortChange: setSorting,
            },

            cellRenderer: Cell,
            cellRendererParams: (key: number, datum: Data) => ({
                value: datum.age,
            }),
        },
    ];

    const data = [
        { order: 4, name: 'sita', age: 12 },
        { order: 1, name: 'hari', age: 10 },
        { order: 3, name: 'gita', age: 20 },
        { order: 6, name: 'ram', age: 25 },
        { order: 2, name: 'shyam', age: 12 },
        { order: 5, name: 'shankar', age: 11 },
    ];

    return (
        <div className={_cs(className, styles.glossary)}>
            <Table
                data={data}
                keySelector={keySelector}
                columns={columns}
                sortDirection={sorting?.direction}
                sortColumn={sorting?.name}
            />
        </div>
    );
}
export default Glossary;
