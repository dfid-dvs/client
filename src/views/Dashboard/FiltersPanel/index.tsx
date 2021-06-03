import React from 'react';
import ProgramSelector from '#components/ProgramSelector';

interface FiltersPanelProps {
    className?: string;
    isMinimized?: boolean;
    startDate?: string;
    endDate?: string;
    dataExplored?: boolean;
}
export default function FiltersPanel(props: FiltersPanelProps) {
    const {
        className,
        isMinimized,
        startDate,
        endDate,
        dataExplored,
    } = props;

    return (
        <ProgramSelector
            className={className}
            isMinimized={isMinimized}
            startDate={startDate}
            endDate={endDate}
            dataExplored={dataExplored}
        />
    );
}
