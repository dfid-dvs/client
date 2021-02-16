import React, { useCallback } from 'react';
import { IoIosArrowDropdownCircle, IoIosArrowDropupCircle, IoIosDocument, IoIosSearch } from 'react-icons/io';
import { _cs } from '@togglecorp/fujs';

import TreeInput from '#components/TreeInput';

import styles from './styles.css';
import TextInput from '#components/TextInput';

interface TreeItem {
    key: string;
    id: number;
    parentKey: string | undefined;
    parentId: number | undefined;
    name: string;
}
const treeKeySelector = (item: TreeItem) => item.key;
const treeParentSelector = (item: TreeItem) => item.parentKey;
const treeLabelSelector = (item: TreeItem) => item.name;

type ExpanedFilter = 'programs' | 'partners' | 'sectors' | 'markers';

interface SelectorItemProps {
    name: ExpanedFilter;
    className?: string;
    options: TreeItem[] | undefined;
    value: string[] | undefined;
    setSelectedValue: React.Dispatch<React.SetStateAction<string[] | undefined>>;
    collapseLevel?: number;
    expandedFilters: ExpanedFilter[];
    setExpandedFilters: React.Dispatch<React.SetStateAction<ExpanedFilter[]>>;
    isMinimized?: boolean;
    icon?: JSX.Element;
    searchText?: string;
    setSearchText?: React.Dispatch<React.SetStateAction<string | undefined>>;
}
export default function SelectorItem(props: SelectorItemProps) {
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
    } = props;

    const isFilterExpanded = !!expandedFilters.find(e => e === name);

    const onExpandFilter = useCallback(() => {
        setExpandedFilters([...expandedFilters, name]);
    }, [setExpandedFilters, expandedFilters, name]);

    const onCollapseFilter = useCallback(() => {
        const filters = [...expandedFilters].filter(e => e !== name);
        setExpandedFilters(filters);
    }, [setExpandedFilters, expandedFilters, name]);

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
                    <IoIosArrowDropupCircle
                        onClick={onCollapseFilter}
                        className={styles.collapseIcon}
                    />
                ) : (
                    <IoIosArrowDropdownCircle
                        onClick={onExpandFilter}
                        className={styles.collapseIcon}
                    />
                )}
                <div className={styles.icon}>
                    {icon}
                </div>
                {/* <IoIosDocument className={styles.icon} /> */}
                <div className={styles.name}>
                    {name}
                </div>
            </div>
            <TextInput
                placeholder="Search"
                value={searchText}
                onChange={setSearchText}
                autoFocus
                icons={<IoIosSearch />}
            />
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
                />
            )}
        </div>
    );
}
