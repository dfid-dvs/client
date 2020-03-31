import React from 'react';
import {
    _cs,
    caseInsensitiveSubmatch,
    compareStringSearch,
    listToMap,
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
    // children: React.ReactNode;
    label?: string;
    options: T[];
    optionLabelSelector: (d: T) => string;
    optionKeySelector: (d: T) => K;
    // FIXME: value shouldn't be string
    value: K | undefined;
    onChange: (d: K | undefined) => void;
    disabled?: boolean;
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
    } = props;

    const inputContainerRef = React.useRef(null);
    const inputElementRef = React.useRef(null);
    const dropdownRef = React.useRef(null);
    const [showDropdown, setShowDropdown] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');

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
            .filter(option => caseInsensitiveSubmatch(optionLabelSelector(option), inputValue))
            .sort((a, b) => compareStringSearch(
                optionLabelSelector(a),
                optionLabelSelector(b),
                inputValue,
            ));

        return newOptions;
    }, [showDropdown, options, optionLabelSelector, inputValue]);

    const optionMap = React.useMemo(() => (
        listToMap(options, optionKeySelector, optionLabelSelector)
    ), [options, optionKeySelector, optionLabelSelector]);

    const handleOptionClick = React.useCallback((optionKey) => {
        setInputValue(optionMap[optionKey]);
        setShowDropdown(false);
        onChange(optionKey);
    }, [onChange, setShowDropdown, setInputValue, optionMap]);

    const handleInputClick = React.useCallback(() => {
        setShowDropdown(true);

        const { current: inputContainer } = inputElementRef;
        if (inputContainer) {
            inputContainer.select();
        }
    }, [setShowDropdown]);

    return (
        <>
            <TextInput
                className={_cs(className, styles.selectInput)}
                elementRef={inputContainerRef}
                inputRef={inputElementRef}
                onClick={handleInputClick}
                value={inputValue}
                onChange={setInputValue}
                placeholder="Select an option"
                disabled={disabled}
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
        </>
    );
}

export default SelectInput;
