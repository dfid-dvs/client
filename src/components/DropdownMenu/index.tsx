import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { getFloatPlacement } from '#utils/common';

import Portal from '#components/Portal';
import RawButton from '#components/RawButton';

import styles from './styles.css';

interface DropdownProps {
    className?: string;
    parentRef: React.RefObject<HTMLElement>;
    children: React.ReactNode;
}

function Dropdown(props: DropdownProps) {
    const {
        parentRef,
        children,
        className,
    } = props;

    const style = getFloatPlacement(parentRef);

    return (
        <div
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
    const [showDropdown, setShowDropdown] = React.useState(false);

    return (
        <>
            <RawButton
                className={_cs(className, styles.dropdownMenu)}
                elementRef={buttonRef}
                onClick={() => { setShowDropdown(!showDropdown); }}
            >
                { label }
            </RawButton>
            { showDropdown && (
                <Portal>
                    <Dropdown
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
