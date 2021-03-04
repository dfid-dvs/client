import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import useBlurEffect from '#hooks/useBlurEffect';

import Portal from '#components/Portal';
import RawButton from '#components/RawButton';
import Dropdown from '#components/Dropdown';

import styles from './styles.css';

interface Props {
    className?: string;
    dropdownContainerClassName?: string;
    children: React.ReactNode;
    label: React.ReactNode;
    disabled?: boolean;
}
function DropdownMenu(props: Props) {
    const {
        className,
        dropdownContainerClassName,
        children,
        label,
        disabled,
    } = props;

    const buttonRef = React.useRef(null);
    const dropdownRef = React.useRef(null);

    const [showDropdown, setShowDropdown] = React.useState(false);

    useBlurEffect(showDropdown, setShowDropdown, dropdownRef, buttonRef);

    const handleShowDropdown = useCallback(
        () => {
            setShowDropdown(true);
        },
        [],
    );

    return (
        <>
            <RawButton
                className={_cs(
                    className,
                    styles.dropdownMenu,
                    showDropdown && styles.dropdownShown,
                )}
                elementRef={buttonRef}
                onClick={handleShowDropdown}
                disabled={disabled}
            >
                { label }
            </RawButton>
            {showDropdown && (
                <Portal>
                    <Dropdown
                        elementRef={dropdownRef}
                        className={dropdownContainerClassName}
                        parentRef={buttonRef}
                    >
                        { children }
                    </Dropdown>
                </Portal>
            )}
        </>
    );
}

export default DropdownMenu;
