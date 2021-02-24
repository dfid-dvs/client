import React, { memo, useCallback, useState, useRef } from 'react';
import { _cs, isTruthyString } from '@togglecorp/fujs';

import {
    FaSortUp,
    FaSortDown,
    FaSort,
    FaLessThanEqual,
    FaGreaterThanEqual,
    FaSearch,
    FaGripVertical,
} from 'react-icons/fa';
import {
    IoMdEyeOff,
} from 'react-icons/io';

import Button from '#components/Button';
import TextInput from '#components/TextInput';
import NumberInput from '#components/NumberInput';

import { BaseHeader, SortDirection, FilterType } from '../types';
import { SortParameter } from '../useSorting';
import { FilterParameter } from '../useFiltering';

import styles from './styles.css';

interface DragHandler<T> {
    (e: React.DragEvent<T>): void;
}

function useDropHandler(
    dragStartHandler: DragHandler<HTMLDivElement>,
    dropHandler: DragHandler<HTMLDivElement>,
) {
    const [dropping, setDropping] = useState(false);
    const dragEnterCount = useRef(0);

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        if (dragEnterCount.current === 0) {
            setDropping(true);

            dragStartHandler(e);
        }
        dragEnterCount.current += 1;
    };
    const onDragLeave = () => {
        dragEnterCount.current -= 1;
        if (dragEnterCount.current === 0) {
            setDropping(false);
        }
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        dragEnterCount.current = 0;
        setDropping(false);

        dropHandler(e);

        e.preventDefault();
    };


    return {
        dropping,

        onDragOver,
        onDragEnter,
        onDragLeave,
        onDrop,
    };
}

interface HeaderCellProps extends BaseHeader {
    onSortChange?: (value: SortParameter | undefined) => void;

    sortable?: boolean;
    sortDirection?: SortDirection;
    defaultSortDirection?: SortDirection;

    filterType?: FilterType;
    filterValue?: Omit<FilterParameter, 'id'>;
    onFilterValueChange?: (name: string, value: Omit<FilterParameter, 'id'>) => void;

    draggable?: boolean;
    onReorder?: (drag: string, drop: string) => void;

    hideable?: boolean;
    onHide?: (itemKey: string) => void;
}

interface DropInfo {
    name: string;
    index: number;
}

let tempDropInfo: DropInfo | undefined;

function HeaderCell(props: HeaderCellProps) {
    const {
        className,
        title,
        name,
        index,

        defaultSortDirection,
        sortDirection,
        sortable,
        onSortChange,

        filterType,
        filterValue,
        onFilterValueChange,

        draggable,
        onReorder,

        hideable,
        onHide,
    } = props;

    const [dragging, setDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleHideClick = useCallback(
        () => {
            if (onHide) {
                onHide(name);
            }
        },
        [onHide, name],
    );

    const handleSortClick = useCallback(
        () => {
            if (!onSortChange) {
                return;
            }
            let newSortDirection: SortDirection | undefined;
            if (!sortDirection) {
                newSortDirection = defaultSortDirection;
            } else if (sortDirection === SortDirection.asc) {
                newSortDirection = SortDirection.dsc;
            } else if (sortDirection === SortDirection.dsc) {
                newSortDirection = SortDirection.asc;
            }

            if (newSortDirection) {
                onSortChange({ name, direction: newSortDirection });
            } else {
                onSortChange(undefined);
            }
        },
        [name, onSortChange, sortDirection, defaultSortDirection],
    );

    const handleDragStart = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            setDragging(true);

            if (containerRef.current) {
                const size = containerRef.current.getBoundingClientRect();
                e.dataTransfer.setDragImage(containerRef.current, size.width, 0);
            }
            const content: DropInfo = {
                name,
                index,
            };
            e.dataTransfer.dropEffect = 'move';
            e.dataTransfer.setData('text/plain', JSON.stringify(content));

            tempDropInfo = content;
        },
        [index, name],
    );
    const handleDragEnd = useCallback(
        () => {
            setDragging(false);

            tempDropInfo = undefined;
        },
        [],
    );

    const [dropInfo, setDropInfo] = useState<DropInfo | undefined>();

    const handleDragEnter = useCallback(
        () => {
            // NOTE: this is a hack as we event.dataTransfer.getData() doesn't work
            setDropInfo(tempDropInfo);
        },
        [],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            if (!onReorder) {
                return;
            }

            try {
                const data = e.dataTransfer.getData('text/plain');
                const parsedData = JSON.parse(data) as DropInfo;

                if (parsedData.name) {
                    onReorder(parsedData.name, name);
                }
            } catch (ex) {
                console.error(ex);
            }
        },
        [name, onReorder],
    );

    const {
        dropping,
        onDragOver,
        onDragEnter,
        onDragLeave,
        onDrop,
    } = useDropHandler(handleDragEnter, handleDrop);

    const onStringFilterChange = ((value: string) => {
        if (onFilterValueChange) {
            onFilterValueChange(
                name,
                { ...filterValue, subMatch: value },
            );
        }
    });
    const onNumericFilterMinChange = (value: string) => {
        if (onFilterValueChange) {
            const numericValue = isTruthyString(value) ? +value : undefined;
            onFilterValueChange(
                name,
                { ...filterValue, greaterThanOrEqualTo: numericValue },
            );
        }
    };
    const onNumericFilterMaxChange = (value: string) => {
        if (onFilterValueChange) {
            const numericValue = isTruthyString(value) ? +value : undefined;
            onFilterValueChange(
                name,
                { ...filterValue, lessThanOrEqualTo: numericValue },
            );
        }
    };

    return (
        <div
            ref={containerRef}
            className={_cs(
                className,
                styles.headerCell,
                dragging && styles.dragging,
                (!dragging && dropping) && (
                    dropInfo && index > dropInfo.index
                        ? styles.droppingBehind
                        : styles.dropping
                ),
            )}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div
                className={_cs(styles.titleContainer)}
            >
                {sortable && (
                    <Button
                        transparent
                        onClick={handleSortClick}
                        title="Sort column"
                    >
                        {!sortDirection && <FaSort />}
                        {sortDirection === SortDirection.asc && <FaSortUp />}
                        {sortDirection === SortDirection.dsc && <FaSortDown />}
                    </Button>
                )}
                <div
                    className={styles.title}
                >
                    {title}
                </div>
                {hideable && (
                    <Button
                        className={styles.hideButton}
                        transparent
                        onClick={handleHideClick}
                        title="Hide column"
                    >
                        <IoMdEyeOff />
                    </Button>
                )}
                {draggable && (
                    <div
                        className={styles.grip}
                        role="presentation"
                        draggable
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <FaGripVertical />
                    </div>
                )}
            </div>
            <div className={styles.filterContainer}>
                {filterType === FilterType.string && (
                    <TextInput
                        icons={<FaSearch className={styles.icon} />}
                        className={styles.textInput}
                        inputContainerClassName={styles.rawInputContainer}
                        inputClassName={styles.rawInput}
                        value={filterValue?.subMatch}
                        placeholder="Search"
                        onChange={onStringFilterChange}
                    />
                )}
                {filterType === FilterType.number && (
                    <>
                        <NumberInput
                            icons={<FaGreaterThanEqual className={styles.icon} />}
                            className={styles.numberInput}
                            inputContainerClassName={styles.rawInputContainer}
                            inputClassName={styles.rawInput}
                            value={filterValue?.greaterThanOrEqualTo}
                            placeholder="Min"
                            type="number"
                            onChange={onNumericFilterMinChange}
                        />
                        <NumberInput
                            icons={<FaLessThanEqual className={styles.icon} />}
                            className={styles.numberInput}
                            inputContainerClassName={styles.rawInputContainer}
                            inputClassName={styles.rawInput}
                            value={filterValue?.lessThanOrEqualTo}
                            placeholder="Max"
                            onChange={onNumericFilterMaxChange}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

HeaderCell.defaultProps = {
    defaultSortDirection: SortDirection.asc,
};

export default memo(HeaderCell);
