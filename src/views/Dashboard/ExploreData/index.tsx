import React from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { Link } from 'react-router-dom';
import DropdownMenu from '#components/DropdownMenu';

import styles from './styles.css';

interface ExploreDataProps {
    className?: string;
}
export default function ExploreData(props: ExploreDataProps) {
    const { className } = props;

    return (
        <DropdownMenu
            className={className}
            dropdownContainerClassName={styles.exploreData}
            label={(
                <div className={styles.title}>
                    Explore Data
                    <IoMdArrowDropdown />
                </div>
            )}
        >
            <div className={styles.actions}>
                <Link
                    className={styles.link}
                    to="#regions"
                    replace
                >
                    By Region
                </Link>
                <Link
                    className={styles.link}
                    to="#programs"
                    replace
                >
                    By Program
                </Link>
            </div>
        </DropdownMenu>
    );
}
