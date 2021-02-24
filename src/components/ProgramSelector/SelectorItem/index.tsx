import React, { useCallback, useMemo } from 'react';
import { IoIosSearch, IoMdArrowDropdown, IoMdArrowDropup, IoMdClose } from 'react-icons/io';
import { _cs } from '@togglecorp/fujs';

import TreeInput from '#components/TreeInput';

import styles from './styles.css';
import TextInput from '#components/TextInput';

interface TreeItem<T extends string | number> {
    key: T;
    id: number;
    parentKey: T | undefined;
    parentId: number | undefined;
    name: string;
}
function treeKeySelector<T extends string | number>(item: TreeItem<T>) {
    return item.key;
}
function treeParentSelector<T extends string | number>(item: TreeItem<T>) {
    return item.parentKey;
}
function treeLabelSelector<T extends string | number>(item: TreeItem<T>) {
    return item.name;
}

type ExpanedFilter = 'programs' | 'partners' | 'sectors' | 'markers';

interface SelectorItemProps<T extends string | number> {
    name: ExpanedFilter;
    className?: string;
    options: TreeItem<T>[] | undefined;
    value: T[];
    setSelectedValue: (keys: T[]) => void;
    collapseLevel?: number;
    expandedFilters: ExpanedFilter[];
    setExpandedFilters: React.Dispatch<React.SetStateAction<ExpanedFilter[]>>;
    isMinimized?: boolean;
    icon?: JSX.Element;
    searchText: string;
    setSearchText: React.Dispatch<React.SetStateAction<string>>;
    enabledIds?: number[] | string[];
}
export default function SelectorItem<T extends string | number>(props: SelectorItemProps<T>) {
    const {
        name,
        className,
        options,
        value,
        setSelectedValue,
        collapseLevel = 0,
        expandedFilters,
        setExpandedFilters,
        isMinimized,
        icon,
        searchText,
        setSearchText,
        enabledIds,
    } = props;

    const isFilterExpanded = useMemo(
        () => (
            !!expandedFilters.find(e => e === name)
        ),
        [expandedFilters, name],
    );

    const onExpandFilter = useCallback(() => {
        setExpandedFilters([...expandedFilters, name]);
    }, [setExpandedFilters, expandedFilters, name]);

    const onCollapseFilter = useCallback(() => {
        const filters = [...expandedFilters].filter(e => e !== name);
        setExpandedFilters(filters);
    }, [setExpandedFilters, expandedFilters, name]);

    const onResetFilter = useCallback(() => {
        setSelectedValue([]);
    }, [setSelectedValue]);

    const selectedValueCount = value.length;

    if (isMinimized) {
        return (
            <div className={styles.selectorItem}>
                <div className={_cs(styles.heading, styles.centered)}>
                    <div className={styles.minimizedIcon}>
                        {icon}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.selectorItem}>
            <div className={styles.heading}>
                {isFilterExpanded ? (
                    <IoMdArrowDropup
                        onClick={onCollapseFilter}
                        className={styles.collapseIcon}
                    />
                ) : (
                    <IoMdArrowDropdown
                        onClick={onExpandFilter}
                        className={styles.collapseIcon}
                    />
                )}
                <div className={styles.icon}>
                    {icon}
                </div>
                <div className={styles.name}>
                    {name}
                </div>
                {selectedValueCount > 0 && (
                    <div className={styles.rightSection}>
                        <div className={styles.valueCount}>
                            {selectedValueCount}
                        </div>
                        <IoMdClose
                            onClick={onResetFilter}
                            className={styles.clearValue}
                        />
                    </div>
                )}
            </div>
            {isFilterExpanded && (
                <TextInput
                    placeholder="Search"
                    value={searchText}
                    onChange={setSearchText}
                    autoFocus
                    icons={<IoIosSearch className={styles.searchIcon} />}
                />
            )}
            {isFilterExpanded && (
                <TreeInput
                    className={_cs(className, styles.treeInput)}
                    keySelector={treeKeySelector}
                    parentKeySelector={treeParentSelector}
                    labelSelector={treeLabelSelector}
                    options={options}
                    value={value}
                    onChange={setSelectedValue}
                    defaultCollapseLevel={collapseLevel}
                    labelClassName={styles.label}
                    showClearButton={false}
                    enabledOptions={enabledIds}
                />
            )}
        </div>
    );
}
