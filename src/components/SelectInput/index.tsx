import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import { GrCheckmark } from 'react-icons/gr';
// import { IoIosSearch } from 'react-icons/io';
import { IoMdArrowDropdown, IoMdArrowDropup, IoMdClose } from 'react-icons/io';
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
import RawButton, { Props as RawButtonProps } from '#components/RawButton';

import styles from './styles.css';

// use memo
function Option(props: RawButtonProps & { selected: boolean }) {
    const ref = useRef<HTMLButtonElement>(null);
    const focusedByMouse = useRef(false);

    const { selected, ...otherProps } = props;

    useEffect(
        () => {
            if (selected && !focusedByMouse.current && ref.current) {
                ref.current.scrollIntoView({
                    // behavior: 'smooth',
                    block: 'center',
                });
            }
        },
        [selected],
    );

    const handleMouseMove = useCallback(
        () => {
            focusedByMouse.current = true;
        },
        [],
    );

    const handleMouseLeave = useCallback(
        () => {
            focusedByMouse.current = false;
        },
        [],
    );

    return (
        <RawButton
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
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
    labelClassName?: string;
    inputClassName?: string;
    options: T[] | undefined;
    optionLabelSelector: (d: T) => string;
    optionKeySelector: (d: T) => K;
    value: K | undefined;
    onChange: (d: K | undefined) => void;
    disabled?: boolean;
    pending?: boolean;
    placeholder?: string;
    hideLabel?: boolean;
    error?: string;
    groupKeySelector?: (d: T) => string;
    nonClearable?: boolean;
    autoFocus?: boolean;
    showDropDownIcon?: boolean;
}

function SelectInput<T, K extends string | number>(props: Props<T, K>) {
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
        placeholder = 'Select an option',
        groupKeySelector,
        label,
        labelClassName,
        nonClearable,
        autoFocus,
        inputClassName,
        showDropDownIcon,
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
            const option = options?.find(o => optionKeySelector(o) === value);
            if (isNotDefined(option)) {
                return '';
            }
            return optionLabelSelector(option);
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

            setShowDropdown(false);
            setSearchValue(undefined);

            onChange(optionKeySelector(option));
        },
        [onChange, options, optionKeySelector],
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

    const handleDropdownIconToggle = React.useCallback(
        () => {
            setShowDropdown(prevState => !prevState);
        },
        [setShowDropdown],
    );

    const handleInputValueChange = React.useCallback(
        (newInputValue: string) => {
            setSearchValue(newInputValue);

            setShowDropdown(true);
        },
        [],
    );

    const handleClearClick = React.useCallback(
        () => {
            onChange(undefined);
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
            const selected = key === value;
            const optionLabel = optionLabelSelector(datum);

            return {
                selected,
                className: _cs(styles.option, selected && styles.selected),
                name: String(key),
                onClick: handleOptionClick,
                disabled: disabled || selected,
                children: selected ? (
                    <>
                        { optionLabel }
                        <GrCheckmark />
                    </>
                ) : optionLabel,
            };
        },
        [disabled, handleOptionClick, optionLabelSelector, value],
    );

    return (
        <div
            className={_cs(className, styles.selectInput)}
            title={label}
        >
            <TextInput
                label={label}
                className={styles.textInput}
                labelClassName={labelClassName}
                inputClassName={inputClassName}
                elementRef={inputContainerRef}
                inputRef={inputElementRef}
                onClick={handleInputClick}
                value={isDefined(searchValue) ? searchValue : inputValue}
                onChange={handleInputValueChange}
                placeholder={placeholder}
                disabled={disabled}
                autoFocus={autoFocus}
                actions={(
                    <>
                        {pending && (
                            <LoadingAnimation />
                        )}
                        {isDefined(value) && !nonClearable && (
                            <Button
                                className={styles.clearButton}
                                transparent
                                name="close"
                                onClick={handleClearClick}
                                disabled={disabled}
                                icons={(
                                    <IoMdClose />
                                )}
                            />
                        )}
                        {showDropDownIcon && showDropdown && (
                            <IoMdArrowDropup
                                onClick={handleDropdownIconToggle}
                            />
                        )}
                        {showDropDownIcon && !showDropdown && (
                            <IoMdArrowDropdown
                                onClick={handleDropdownIconToggle}
                            />
                        )}
                    </>
                )}
            />
            { showDropdown && (
                <Portal>
                    <Dropdown
                        ref={dropdownRef}
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
        </div>
    );
}

export default SelectInput;
