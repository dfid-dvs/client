import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import { getFloatPlacement } from '#utils/common';
import useBlurEffect from '#hooks/useBlurEffect';

import Portal from '#components/Portal';
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

interface Props {
    className?: string;
    dropdownContainerClassName?: string;
    children: React.ReactNode;
    label: string | undefined;
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
