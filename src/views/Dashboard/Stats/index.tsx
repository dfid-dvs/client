import React, { useState, useMemo } from 'react';
import { compareString, compareNumber, _cs } from '@togglecorp/fujs';

import Table from '#components/Table';
import HeaderCell from '#components/Table/HeaderCell';
import Cell from '#components/Table/Cell';
import { SortDirection } from '#components/Table/types';
import Numeral from '#components/Numeral';

import { FiveW } from '../types';

import styles from './styles.css';

interface Props {
    className: string;
    fiveW: FiveW[];
}

function Stats(props: Props) {
    const { className, fiveW } = props;

    const [sorting, setSorting] = useState<{
        name: string;
        direction: SortDirection;
    } | undefined>();

    const keySelector = (data: FiveW) => data.id;

    const columns = useMemo(
        () => ([
            {
                id: 'name',
                title: 'Name',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSorting,
                },

                cellAsHeader: true,
                cellRenderer: Cell,
                cellRendererParams: (key: number, datum: FiveW) => ({
                    value: datum.name,
                }),

                sorter: (foo: FiveW, bar: FiveW) => compareString(
                    foo.name,
                    bar.name,
                ),
            },
            {
                id: 'allocatedBudget',
                title: 'Allocated Budget',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSorting,
                },

                cellRenderer: Numeral,
                cellRendererParams: (key: number, datum: FiveW) => ({
                    value: datum.allocatedBudget,
                    normalize: true,
                }),

                sorter: (foo: FiveW, bar: FiveW) => compareNumber(
                    foo.allocatedBudget,
                    bar.allocatedBudget,
                ),
                defaultSortDirection: SortDirection.dsc,
            },
            {
                id: 'maleBeneficiary',
                title: 'Male Beneficiary',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSorting,
                },

                cellRenderer: Numeral,
                cellRendererParams: (key: number, datum: FiveW) => ({
                    value: datum.maleBeneficiary,
                    normalize: true,
                }),

                sorter: (foo: FiveW, bar: FiveW) => compareNumber(
                    foo.maleBeneficiary,
                    bar.maleBeneficiary,
                ),
                defaultSortDirection: SortDirection.dsc,
            },
            {
                id: 'femaleBeneficiary',
                title: 'Female Beneficiary',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSorting,
                },

                cellRenderer: Numeral,
                cellRendererParams: (key: number, datum: FiveW) => ({
                    value: datum.femaleBeneficiary,
                    normalize: true,
                }),

                sorter: (foo: FiveW, bar: FiveW) => compareNumber(
                    foo.femaleBeneficiary,
                    bar.femaleBeneficiary,
                ),
                defaultSortDirection: SortDirection.dsc,
            },
            {
                id: 'totalBeneficiary',
                title: 'Total Beneficiary',

                headerCellRenderer: HeaderCell,
                headerCellRendererParams: {
                    onSortChange: setSorting,
                },

                cellRenderer: Numeral,
                cellRendererParams: (key: number, datum: FiveW) => ({
                    value: datum.totalBeneficiary,
                    normalize: true,
                }),

                sorter: (foo: FiveW, bar: FiveW) => compareNumber(
                    foo.totalBeneficiary,
                    bar.totalBeneficiary,
                ),
                defaultSortDirection: SortDirection.dsc,
            },
        ]),
        [],
    );

    return (
        <div className={_cs(className, styles.stats)}>
            <h3>Region-wise data</h3>
            <Table
                data={fiveW}
                keySelector={keySelector}
                columns={columns}
                sortDirection={sorting?.direction}
                sortColumn={sorting?.name}
            />
            <h3>Program-wise data</h3>
        </div>
    );
}
export default Stats;
