import React from 'react';
import { IoIosSearch } from 'react-icons/io';
import {
    _cs,
    caseInsensitiveSubmatch,
    compareStringSearch,
    listToMap,
    isDefined,
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
    options: T[];
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

    const optionMap = React.useMemo(() => (
        listToMap(options, optionKeySelector, optionLabelSelector)
    ), [options, optionKeySelector, optionLabelSelector]);

    const inputContainerRef = React.useRef<HTMLDivElement>(null);
    const inputElementRef = React.useRef<HTMLInputElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const [showDropdown, setShowDropdown] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(isDefined(value) ? optionMap[value] : '');
    const [searchValue, setSearchValue] = React.useState('');

    const hideDropdownOnBlur = React.useCallback((isInsideClick) => {
        if (!isInsideClick) {
            setShowDropdown(false);
        }
    }, [setShowDropdown]);

    useBlurEffect(showDropdown, hideDropdownOnBlur, dropdownRef, inputContainerRef);

    const filteredOptions = React.useMemo(() => {
        if (!showDropdown) {
            return [];
        }

        const newOptions = options
            .filter(option => caseInsensitiveSubmatch(optionLabelSelector(option), searchValue))
            .sort((a, b) => compareStringSearch(
                optionLabelSelector(a),
                optionLabelSelector(b),
                searchValue,
            ));

        return newOptions;
    }, [showDropdown, options, optionLabelSelector, searchValue]);

    const handleOptionClick = React.useCallback((optionKey) => {
        setInputValue(optionMap[optionKey]);
        setShowDropdown(false);
        onChange(optionKey);
        setSearchValue('');
    }, [onChange, setShowDropdown, setSearchValue, optionMap]);

    const handleInputClick = React.useCallback(() => {
        setShowDropdown(true);

        const { current: inputContainer } = inputElementRef;
        if (inputContainer) {
            inputContainer.select();
        }
    }, [setShowDropdown]);

    const handleInputValueChange = React.useCallback((newInputValue) => {
        setInputValue(newInputValue);
        setSearchValue(newInputValue);
    }, [setInputValue, setSearchValue]);

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
                        { filteredOptions.map((d) => {
                            const key = optionKeySelector(d);

                            return (
                                <RawButton
                                    key={key}
                                    className={styles.option}
                                    name={String(key)}
                                    onClick={handleOptionClick}
                                    disabled={disabled}
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
