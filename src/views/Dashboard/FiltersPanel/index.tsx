import React from 'react';
import ProgramSelectors from '#components/ProgramSelectors';

interface FiltersPanelProps {
    className?: string;
    isMinimized?: boolean;
}
export default function FiltersPanel(props: FiltersPanelProps) {
    const {
        className,
        isMinimized,
    } = props;
    return (
        <ProgramSelectors
            className={className}
            isMinimized={isMinimized}
        />
    );
}
