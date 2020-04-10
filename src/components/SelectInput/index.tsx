import React from 'react';
import { IoIosSearch } from 'react-icons/io';
import {
    _cs,
    caseInsensitiveSubmatch,
    compareStringSearch,
    listToMap,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { getFloatPlacement } from '#utils/common';
import { useBlurEffect } from '#hooks';

import Portal from '#components/Portal';
import TextInput from '#components/TextInput';
import RawButton from '#components/RawButton';

import styles from './styles.css';

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

interface Props<T, K> {
    className?: string;
    dropdownContainerClassName?: string;
    label?: string;
    options: T[] | undefined;
    optionLabelSelector: (d: T) => string;
    optionKeySelector: (d: T) => K;
    value: K | undefined;
    onChange: (d: K | undefined) => void;
    disabled?: boolean;
    placeholder?: string;
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
        placeholder = 'Select an option',
    } = props;

    const inputContainerRef = React.useRef<HTMLDivElement>(null);
    const inputElementRef = React.useRef<HTMLInputElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const [showDropdown, setShowDropdown] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');
    // FIXME: set inputValue on options change or value change
    const [inputValue, setInputValue] = React.useState(() => {
        if (isNotDefined(value)) {
            return '';
        }
        const option = options?.find(o => optionKeySelector(o) === value);
        if (isNotDefined(option)) {
            return '';
        }
        return optionLabelSelector(option);
    });

    const hideDropdownOnBlur = React.useCallback(
        (isInsideClick: boolean) => {
            if (!isInsideClick) {
                setShowDropdown(false);
            }
        },
        [setShowDropdown],
    );

    useBlurEffect(showDropdown, hideDropdownOnBlur, dropdownRef, inputContainerRef);

    const filteredOptions = React.useMemo(
        () => {
            if (!showDropdown) {
                return [];
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

            setInputValue(optionLabelSelector(option));
            setShowDropdown(false);
            onChange(optionKeySelector(option));
            setSearchValue('');
        },
        [onChange, options, optionKeySelector, optionLabelSelector],
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
        (newInputValue) => {
            setInputValue(newInputValue);
            setSearchValue(newInputValue);
        },
        [],
    );

    return (
        <div className={_cs(className, styles.selectInput)}>
            <TextInput
                className={styles.textInput}
                elementRef={inputContainerRef}
                inputRef={inputElementRef}
                onClick={handleInputClick}
                value={inputValue}
                onChange={handleInputValueChange}
                placeholder={placeholder}
                disabled={disabled}
                icons={<IoIosSearch />}
            />
            { showDropdown && (
                <Portal>
                    <Dropdown
                        elementRef={dropdownRef}
                        className={dropdownContainerClassName}
                        parentRef={inputContainerRef}
                    >
                        { filteredOptions?.map((d) => {
                            const key = optionKeySelector(d);
                            const selected = key === value;
                            // FIXME: style disabled item differently
                            // FIXME: rawbutton doesn't show difference between disabled
                            // elements

                            return (
                                <RawButton
                                    key={key}
                                    className={styles.option}
                                    name={String(key)}
                                    onClick={handleOptionClick}
                                    disabled={disabled || selected}
                                >
                                    {optionLabelSelector(d)}
                                </RawButton>
                            );
                        })}
                    </Dropdown>
                </Portal>
            )}
        </div>
    );
}

export default SelectInput;
