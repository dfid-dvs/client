import React, { useMemo, useRef, useCallback } from 'react';
// import { IoIosSearch } from 'react-icons/io';
import { IoMdClose, IoMdDoneAll } from 'react-icons/io';
import {
    _cs,
    caseInsensitiveSubmatch,
    compareStringSearch,
    isNotDefined,
    isFalsyString,
    isDefined,
} from '@togglecorp/fujs';

import useBlurEffect from '#hooks/useBlurEffect';

import Dropdown from '#components/Dropdown';
import LoadingAnimation from '#components/LoadingAnimation';
import List from '#components/List';
import Button from '#components/Button';
import Portal from '#components/Portal';
import TextInput from '#components/TextInput';
import InputLabel from '#components/InputLabel';
import CheckboxButton from '#components/CheckboxButton';

import styles from './styles.css';

// use memo
interface OptionProps {
    name: string;
    selected: boolean;
    onClick: (name: string) => void;
    className?: string;
    disabled?: boolean;
    pending?: boolean;
    children?: React.ReactNode;
}
function Option(props: OptionProps) {
    const ref = useRef<HTMLButtonElement>(null);

    const { name, onClick, selected, ...otherProps } = props;

    const onChange = useCallback(
        () => {
            onClick(name);
        },
        [onClick, name],
    );

    return (
        <CheckboxButton
            ref={ref}
            onChange={onChange}
            value={selected}
            {...otherProps}
        />
    );
}

interface GroupNameProps {
    name: string;
    className?: string;
}
function GroupName(props: GroupNameProps) {
    const {
        name,
        className,
    } = props;

    return (
        <div className={className}>
            {name}
        </div>
    );
}

interface Props<T, K> {
    className?: string;
    dropdownContainerClassName?: string;
    label?: string;
    options: T[] | undefined;
    optionLabelSelector: (d: T) => string;
    optionKeySelector: (d: T) => K;
    value: K[] | undefined;
    onChange: (d: K[]) => void;
    disabled?: boolean;
    pending?: boolean;
    placeholder?: string;
    groupKeySelector?: (d: T) => string;
    allSelectable?: boolean;
}

function MultiSelectInput<T, K extends string | number>(props: Props<T, K>) {
    const {
        className,
        dropdownContainerClassName,
        options,
        optionLabelSelector,
        optionKeySelector,
        value,
        onChange,
        disabled,
        pending,
        placeholder = 'Select options',
        groupKeySelector,
        label,
        allSelectable,
    } = props;

    const inputContainerRef = React.useRef<HTMLDivElement>(null);
    const inputElementRef = React.useRef<HTMLInputElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const [showDropdown, setShowDropdown] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState<string | undefined>();

    const inputValue = useMemo(
        () => {
            if (isNotDefined(value)) {
                return '';
            }
            const option = options?.filter(o => value.includes(optionKeySelector(o)));
            if (isNotDefined(option)) {
                return '';
            }
            return option.map(optionLabelSelector).join(', ');
        },
        [optionKeySelector, optionLabelSelector, options, value],
    );

    const hideDropdownOnBlur = React.useCallback(
        (isInsideClick: boolean) => {
            if (!isInsideClick) {
                setShowDropdown(false);
                setSearchValue(undefined);
            }
        },
        [setShowDropdown],
    );

    useBlurEffect(showDropdown, hideDropdownOnBlur, dropdownRef, inputContainerRef);

    const filteredOptions = React.useMemo(
        () => {
            if (!showDropdown) {
                return undefined;
            }
            if (isFalsyString(searchValue)) {
                return options;
            }

            const newOptions = options
                ?.filter(option => (
                    caseInsensitiveSubmatch(optionLabelSelector(option), searchValue)
                ))
                .sort((a, b) => compareStringSearch(
                    optionLabelSelector(a),
                    optionLabelSelector(b),
                    searchValue,
                ));

            return newOptions;
        },
        [showDropdown, options, optionLabelSelector, searchValue],
    );

    const handleOptionClick = React.useCallback(
        (optionKey: string | undefined) => {
            const option = options?.find(o => String(optionKeySelector(o)) === optionKey);
            if (!option) {
                console.error('There is some problem');
                return;
            }

            // setShowDropdown(false);
            // setSearchValue(undefined);

            const key = optionKeySelector(option);
            if (!value) {
                onChange([key]);
                return;
            }

            const index = value.findIndex(v => v === key);
            if (index === -1) {
                const newValue = [...value, key];
                onChange(newValue);
            } else {
                const newValue = [...value];
                newValue.splice(index, 1);
                onChange(newValue);
            }
        },
        [value, onChange, options, optionKeySelector],
    );

    const handleInputClick = React.useCallback(
        () => {
            setShowDropdown(true);

            const { current: inputContainer } = inputElementRef;
            if (inputContainer) {
                inputContainer.select();
            }
        },
        [],
    );

    const handleInputValueChange = React.useCallback(
        (newInputValue: string) => {
            setSearchValue(newInputValue);

            setShowDropdown(true);
        },
        [],
    );

    const handleSelectAll = React.useCallback(
        () => {
            if (!options) {
                onChange([]);
                return;
            }

            const allValues = options.map(optionKeySelector);
            onChange(allValues);
        },
        [onChange, options, optionKeySelector],
    );

    const handleClearClick = React.useCallback(
        () => {
            onChange([]);
        },
        [onChange],
    );

    const groupRendererParams = useCallback(
        (groupKey: string) => ({
            name: groupKey,
            className: styles.group,
        }),
        [],
    );

    const rendererParams = useCallback(
        (key: K, datum: T) => {
            const selected = value ? value.includes(key) : false;
            return {
                selected,
                className: _cs(styles.option, selected && styles.selected),
                name: String(key),
                onClick: handleOptionClick,
                disabled,
                children: optionLabelSelector(datum),
            };
        },
        [disabled, handleOptionClick, optionLabelSelector, value],
    );

    const valueLength = value ? value.length : 0;
    const optionsLength = options ? options.length : 0;

    return (
        <>
            <TextInput
                label={label}
                className={_cs(className, styles.textInput)}
                elementRef={inputContainerRef}
                inputRef={inputElementRef}
                onClick={handleInputClick}
                value={isDefined(searchValue) ? searchValue : inputValue}
                onChange={handleInputValueChange}
                placeholder={placeholder}
                disabled={disabled}
                actions={(
                    <>
                        {pending && (
                            <LoadingAnimation />
                        )}
                        {value && value.length > 0 && (
                            <div
                                className={styles.countBadge}
                                title={`${value.length} selected`}
                            >
                                {value.length}
                            </div>
                        )}
                        {(optionsLength !== 0 && valueLength !== optionsLength && allSelectable) && ( // eslint-disable-line max-len
                            <Button
                                className={styles.selectAllButton}
                                transparent
                                name="select-all"
                                title="Select all"
                                onClick={handleSelectAll}
                                disabled={disabled || !options}
                                variant="icon"
                                childrenContainerClassName={styles.iconContainer}
                            >
                                <IoMdDoneAll className={styles.icon} />
                            </Button>
                        )}
                        {value && value.length > 0 && (
                            <Button
                                className={styles.clearButton}
                                transparent
                                name="close"
                                onClick={handleClearClick}
                                title="Clear all"
                                disabled={disabled}
                                variant="icon"
                                childrenContainerClassName={styles.iconContainer}
                            >
                                <IoMdClose className={styles.icon} />
                            </Button>
                        )}
                    </>
                )}
            />
            { showDropdown && (
                <Portal>
                    <Dropdown
                        elementRef={dropdownRef}
                        className={_cs(dropdownContainerClassName, styles.dropdownContainer)}
                        parentRef={inputContainerRef}
                    >
                        {(!filteredOptions || filteredOptions.length <= 0) && (
                            <div className={styles.message}>
                                No option available
                            </div>
                        )}
                        {groupKeySelector ? (
                            <List
                                data={filteredOptions}
                                renderer={Option}
                                keySelector={optionKeySelector}
                                rendererParams={rendererParams}
                                grouped
                                groupKeySelector={groupKeySelector}
                                groupRendererParams={groupRendererParams}
                                groupRenderer={GroupName}
                            />
                        ) : (
                            <List
                                data={filteredOptions}
                                renderer={Option}
                                keySelector={optionKeySelector}
                                rendererParams={rendererParams}
                            />
                        )}
                    </Dropdown>
                </Portal>
            )}
        </>
    );
}

export default MultiSelectInput;
