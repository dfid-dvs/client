import React, { useMemo, useState, useCallback } from 'react';
import { isDefined, unique, listToMap, isFalsyString } from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import Button from '#components/Button';
import RegionSelector from '#components/RegionSelector';

import { tableauColors } from '#utils/constants';
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
                color: tableauColors[1],
                valueSelector: item => item.allocatedBudget,
            },
        ],
    },
    {
        id: 'test',
        type: 'pie-chart',
        title: 'Budget spend',
        keySelector: item => item.name,
        valueSelector: item => item.allocatedBudget,
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
                color: tableauColors[2],
                valueSelector: item => item.indicators[119] || null,
            },
            {
                title: 'Financial Institutions',
                color: tableauColors[3],
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
    {
        id: 'test-1',
        type: 'histogram',
        title: 'Frequency of Financial Institutions',
        color: tableauColors[0],
        binCount: 10,
        // valueSelector: item => item.allocatedBudget,
        valueSelector: item => item.indicators[118] || 0,
        dependencies: [118],
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

    const handleChartDelete = useCallback(
        (name: string | undefined) => {
            if (isFalsyString(name)) {
                return;
            }

            setChartSettings(currentChartSettings => (
                currentChartSettings.filter(item => item.id !== name)
            ));
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
                {(extendedFiveWPending || indicatorListPending) && (
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
                        onDelete={handleChartDelete}
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
