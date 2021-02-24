import React from 'react';
import ProgramSelector from '#components/ProgramSelector';

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
        <ProgramSelector
            className={className}
            isMinimized={isMinimized}
        />
    );
}
