import React, { useMemo, useRef, useCallback } from 'react';
// import { IoIosSearch } from 'react-icons/io';
import { IoMdClose } from 'react-icons/io';
import {
    _cs,
    caseInsensitiveSubmatch,
    compareStringSearch,
    isNotDefined,
    isFalsyString,
    isDefined,
} from '@togglecorp/fujs';

import { getFloatPlacement } from '#utils/common';
import useBlurEffect from '#hooks/useBlurEffect';

import List from '#components/List';
import Button from '#components/Button';
import Portal from '#components/Portal';
import TextInput from '#components/TextInput';
import Label from '#components/Label';
import CheckboxButton from '#components/CheckboxButton';

import styles from './styles.css';

// use memo
interface OptionProps {
    name: string;
    selected: boolean;
    onClick: (name: string) => void;
    className?: string;
    disabled?: boolean;
    children?: React.ReactNode;
}
function Option(props: OptionProps) {
    const divRef = useRef<HTMLButtonElement>(null);

    const { name, onClick, selected, ...otherProps } = props;

    const onChange = useCallback(
        () => {
            onClick(name);
        },
        [onClick, name],
    );

    return (
        <CheckboxButton
            elementRef={divRef}
            onChange={onChange}
            value={selected}
            {...otherProps}
        />
    );
}

interface DropdownProps {
    className?: string;
    parentRef: React.RefObject<HTMLElement>;
    elementRef: React.RefObject<HTMLDivElement>;
    children: React.ReactNode;
}
function Dropdown(props: DropdownProps) {
    const {
        parentRef,
        elementRef,
        children,
        className,
    } = props;

    const style = getFloatPlacement(parentRef);

    return (
        <div
            ref={elementRef}
            style={style}
            className={_cs(styles.dropdownContainer, className)}
        >
            { children }
        </div>
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
    placeholder?: string;
    hideLabel?: boolean;
    error?: string;
    // labelRightComponent?: React.ReactNode;
    // labelRightComponentClassName?: string;

    groupKeySelector?: (d: T) => string;
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
        placeholder = 'Select options',
        groupKeySelector,
        hideLabel,
        label,
        error,
        // labelRightComponent,
        // labelRightComponentClassName,
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
                disabled: disabled || selected,
                children: optionLabelSelector(datum),
            };
        },
        [disabled, handleOptionClick, optionLabelSelector, value],
    );

    return (
        <div
            className={_cs(className, styles.selectInput)}
            title={label}
        >
            {!hideLabel && (
                <Label
                    className={styles.label}
                    disabled={disabled}
                    error={!!error}
                    // rightComponent={labelRightComponent}
                    // rightComponentClassName={labelRightComponentClassName}
                >
                    {label}
                </Label>
            )}
            <TextInput
                className={styles.textInput}
                elementRef={inputContainerRef}
                inputRef={inputElementRef}
                onClick={handleInputClick}
                value={isDefined(searchValue) ? searchValue : inputValue}
                onChange={handleInputValueChange}
                placeholder={placeholder}
                disabled={disabled}
                actions={value && value.length > 0 && (
                    <>
                        <div
                            className={styles.countBadge}
                            title={`${value.length} selected`}
                        >
                            {value.length}
                        </div>
                        <Button
                            className={styles.clearButton}
                            transparent
                            name="close"
                            onClick={handleClearClick}
                            variant="danger"
                            icons={(
                                <IoMdClose />
                            )}
                        />
                    </>
                )}
            />
            { showDropdown && (
                <Portal>
                    <Dropdown
                        elementRef={dropdownRef}
                        className={dropdownContainerClassName}
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

export default MultiSelectInput;
