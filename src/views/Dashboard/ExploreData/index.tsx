import React from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { MdChevronRight } from 'react-icons/md';
import { _cs } from '@togglecorp/fujs';
import { Link } from 'react-router-dom';
import DropdownMenu from '#components/DropdownMenu';

import styles from './styles.css';

interface ExploreDataProps {
    className?: string;
    dataExplored?: boolean;
}
export default function ExploreData(props: ExploreDataProps) {
    const {
        className,
        dataExplored = false,
    } = props;

    if (dataExplored) {
        return (
            <div
                className={_cs(
                    className,
                    styles.dataExplored,
                )}
            >
                <Link
                    className={styles.link}
                    to="/"
                    replace
                >
                    <div className={styles.title}>
                        Explore Maps
                        <MdChevronRight
                            fontSize={22}
                            fontWeight="bold"
                        />
                    </div>
                </Link>
            </div>
        );
    }
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
