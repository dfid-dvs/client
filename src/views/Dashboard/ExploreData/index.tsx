import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoMdArrowDropdown } from 'react-icons/io';
import { Link } from 'react-router-dom';
import DropdownMenu from '#components/DropdownMenu';

import styles from './styles.css';
import useBasicToggle from '#hooks/useBasicToggle';

interface ExploreDataProps {
    className?: string;
}
export default function ExploreData(props: ExploreDataProps) {
    const {
        className,
    } = props;

    const [
        dropdownShown,
        showDropdown,
        hideDropdown,
    ] = useBasicToggle();

    return (
        <DropdownMenu
            className={_cs(styles.exploreDataButton, className)}
            dropdownContainerClassName={styles.exploreDataContainer}
            label={(
                <div className={styles.title}>
                    Explore Data
                    <IoMdArrowDropdown
                        onClick={showDropdown}
                    />
                </div>
            )}
        >
            {dropdownShown && (
                <div className={styles.actions}>
                    <Link
                        className={styles.link}
                        to="#regions"
                        replace
                        onClick={hideDropdown}
                    >
                        By Regions
                    </Link>
                    <Link
                        className={styles.link}
                        to="#programs"
                        replace
                        onClick={hideDropdown}
                    >
                        By Programs
                    </Link>
                </div>
            )}
        </DropdownMenu>
    );
}
