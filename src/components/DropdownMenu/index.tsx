import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Portal from '../Portal';
import RawButton from '../RawButton';

import styles from './styles.css';

interface DropdownProps {
    parentRef: React.RefObject<HTMLElement>;
    children: React.ReactNode;
}

function Dropdown(props: DropdownProps) {
    const {
        parentRef,
        children,
    } = props;

    if (parentRef.current !== null) {
        const parentBCR = parentRef.current.getBoundingClientRect();
    }

    return (
        <div className={styles.dropdown}>
            { children }
        </div>
    );
}

interface Props {
    // className?: string;
    children: React.ReactNode;
    label: string | undefined;
}

function DropdownMenu(props: Props) {
    const {
        // className,
        children,
        label,
    } = props;

    const buttonRef = React.useRef(null);
    const [showDropdown, setShowDropdown] = React.useState(false);

    return (
        <>
            <RawButton
                elementRef={buttonRef}
                onClick={() => { setShowDropdown(!showDropdown); }}
            >
                { label }
            </RawButton>
            { showDropdown && (
                <Portal>
                    <Dropdown parentRef={buttonRef}>
                        { children }
                    </Dropdown>
                </Portal>
            )}
        </>
    );
}

export default DropdownMenu;
