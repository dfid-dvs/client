import React, { useMemo, useState, useCallback } from 'react';
import { isDefined, unique, listToMap } from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import Button from '#components/Button';
import Modal from '#components/Modal';
import RegionSelector from '#components/RegionSelector';

import {
    Indicator,
    RegionLevelOption,
} from '#types';

import useExtendedFiveW from '../../useExtendedFiveW';
import { FiveW } from '../../types';

import PolyChart, { ChartSettings, BarChartSettings } from '../PolyChart';

import styles from './styles.css';

const defaultChartSettings: BarChartSettings<ExtendedFiveW> = [
    {
        id: 'budget-information-top',
        type: 'bar-chart',
        title: 'Top 10 budget spend',
        keySelector: item => item.name,
        // layout: 'horizontal',

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
    {
        id: 'budget-information-bottom',
        type: 'bar-chart',
        title: 'Bottom 10 budget spend',
        keySelector: item => item.name,
        // layout: 'horizontal',

        limit: {
            count: 10,
            method: 'min',
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
        id: 'financial-information-bottom',
        type: 'bar-chart',
        title: 'Health and Finance for Bottom 10 budget spend',
        keySelector: item => item.name,
        // layout: 'horizontal',
        bars: [
            {
                title: 'Health Facilities',
                color: 'red',
                valueSelector: item => item.indicators[119] || null,
                stackId: 'facilities',
            },
            {
                title: 'Financial Institutions',
                color: 'blue',
                valueSelector: item => item.indicators[118] || null,
                stackId: 'facilities',
            },
        ],

        limit: {
            count: 10,
            method: 'min',
            valueSelector: item => item.allocatedBudget,
        },

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
                    disabled
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
                <Modal onClose={handleModalClose}>
                    This is the body
                </Modal>
            )}
        </>
    );
}
export default Charts;
