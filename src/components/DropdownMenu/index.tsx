import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { getFloatPlacement } from '#utils/common';
import { useBlurEffect } from '#hooks';

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
}

function DropdownMenu(props: Props) {
    const {
        className,
        dropdownContainerClassName,
        children,
        label,
    } = props;

    const buttonRef = React.useRef(null);
    const dropdownRef = React.useRef(null);
    const [showDropdown, setShowDropdown] = React.useState(false);

    useBlurEffect(showDropdown, setShowDropdown, dropdownRef, buttonRef);

    return (
        <>
            <RawButton
                className={_cs(className, styles.dropdownMenu)}
                elementRef={buttonRef}
                onClick={() => { setShowDropdown(true); }}
            >
                { label }
            </RawButton>
            { showDropdown && (
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
