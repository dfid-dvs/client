import React, { useMemo, useState, useCallback } from 'react';
import { isDefined, unique, listToMap } from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import Button from '#components/Button';
import RegionSelector from '#components/RegionSelector';

import {
    Indicator,
    RegionLevelOption,
} from '#types';

import useExtendedFiveW, { ExtendedFiveW } from '../../useExtendedFiveW';

import PolyChart from './PolyChart';
import { ChartSettings } from './types';
import ChartModal from './ChartModal';

import styles from './styles.css';

const defaultChartSettings: ChartSettings<ExtendedFiveW>[] = [
    {
        id: 'test-1',
        type: 'histogram',
        title: 'Histogram',
        color: 'red',
        binCount: 10,
        // valueSelector: item => item.allocatedBudget,
        valueSelector: item => item.indicators[118] || 0,
        dependencies: [118],
    },
    {
        id: 'test',
        type: 'pie-chart',
        title: 'Budget spend',
        keySelector: item => item.name,
        valueSelector: item => item.allocatedBudget,
    },
    {
        id: 'budget-information-top',
        type: 'bar-chart',
        title: 'Top 10 budget spend',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.allocatedBudget,
        },

        bars: [
            {
                title: 'Allocated Budget',
                color: 'purple',
                valueSelector: item => item.allocatedBudget,
            },
        ],
    },
    {
        id: 'financial-information-top',
        type: 'bar-chart',
        title: 'Health and Finance for Top 10 budget spend',
        keySelector: item => item.name,
        // layout: 'horizontal',
        bars: [
            {
                title: 'Health Facilities',
                color: 'red',
                valueSelector: item => item.indicators[119] || null,
            },
            {
                title: 'Financial Institutions',
                color: 'blue',
                valueSelector: item => item.indicators[118] || null,
            },
        ],

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.allocatedBudget,
        },

        // meta
        dependencies: [119, 118],
    },
];

interface Props {
    programs: number[];

    regionLevel: RegionLevelOption;
    onRegionLevelChange: (v: RegionLevelOption) => void;

    indicatorList: Indicator[] | undefined;
    indicatorListPending: boolean | undefined;
}

function Charts(props: Props) {
    const {
        programs,
        regionLevel,
        onRegionLevelChange,
        indicatorList,
        indicatorListPending,
    } = props;

    const [chartSettings, setChartSettings] = useState<ChartSettings<ExtendedFiveW>[]>(
        defaultChartSettings,
    );

    const [showModal, setModalVisibility] = useState(false);

    const indicatorMapping = useMemo(
        () => listToMap(
            indicatorList,
            item => item.id,
            item => item,
        ),
        [indicatorList],
    );

    // Valid indicators for chart
    const validSelectedIndicators = useMemo(
        () => unique(
            [...chartSettings
                .map(item => item.dependencies)
                .filter(isDefined)
                .flat(),
            ].filter(i => !!indicatorMapping[i]),
            item => item,
        ).sort(),
        [chartSettings, indicatorMapping],
    );

    const handleModalShow = useCallback(() => {
        setModalVisibility(true);
    }, [setModalVisibility]);

    const handleModalClose = useCallback(() => {
        setModalVisibility(false);
    }, [setModalVisibility]);

    const handleChartAdd = useCallback(
        (settings: ChartSettings<ExtendedFiveW>) => {
            setChartSettings(currentChartSettings => [
                ...currentChartSettings,
                settings,
            ]);
        },
        [],
    );

    const [extendedFiveWPending, extendedFiveWList] = useExtendedFiveW(
        regionLevel,
        programs,
        validSelectedIndicators,
    );

    return (
        <>
            <div className={styles.tableActions}>
                <RegionSelector
                    onRegionLevelChange={onRegionLevelChange}
                    regionLevel={regionLevel}
                    searchHidden
                />
                <Button
                    onClick={handleModalShow}
                >
                    Add chart
                </Button>
            </div>
            <div className={styles.charts}>
                {extendedFiveWPending && (
                    <Backdrop className={styles.backdrop}>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                {chartSettings.map(item => (
                    <PolyChart
                        className={styles.chart}
                        key={item.id}
                        data={extendedFiveWList}
                        settings={item}
                    />
                ))}
            </div>
            {showModal && (
                <ChartModal
                    onClose={handleModalClose}
                    onSave={handleChartAdd}
                    indicatorList={indicatorList}
                />
            )}
        </>
    );
}
export default Charts;
