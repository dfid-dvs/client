import React, { useMemo, useState, useCallback } from 'react';
import { isDefined, unique, listToMap, isFalsyString } from '@togglecorp/fujs';
import { IoMdAddCircleOutline } from 'react-icons/io';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import Button from '#components/Button';
import PolyChart from '#components/PolyChart';
import ChartModal from '#components/ChartModal';

import { tableauColors } from '#utils/constants';
import {
    Indicator,
    RegionLevelOption,
    ChartSettings,
    NumericOption,
} from '#types';

import useExtendedFiveW, { ExtendedFiveW } from '../../useExtendedFiveW';
import styles from './styles.css';


const keySelector = (item: ExtendedFiveW) => item.name;

const staticOptions: NumericOption<ExtendedFiveW>[] = [
    {
        key: 'allocatedBudget',
        title: 'Allocated Budget',
        valueSelector: item => item.allocatedBudget,
        category: 'DFID Data',
    },
    {
        key: 'programCount',
        title: 'Programs',
        valueSelector: item => item.programCount,
        category: 'DFID Data',
    },
    {
        key: 'componentCount',
        title: 'Components',
        valueSelector: item => item.componentCount,
        category: 'DFID Data',
    },
    {
        key: 'partnerCount',
        title: 'Partners',
        valueSelector: item => item.partnerCount,
        category: 'DFID Data',
    },
    {
        key: 'sectorCount',
        title: 'Sectors',
        valueSelector: item => item.sectorCount,
        category: 'DFID Data',
    },
];

const defaultChartSettings: ChartSettings<ExtendedFiveW>[] = [
    {
        id: '1',
        type: 'bar-chart',
        title: 'Top 10 by budget',
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
        id: '1.1',
        type: 'bar-chart',
        title: 'Top 10 by programs',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.programCount,
        },

        bars: [
            {
                title: 'Program count',
                color: tableauColors[2],
                valueSelector: item => item.programCount,
            },
        ],
    },
    {
        id: '1.2',
        type: 'bar-chart',
        title: 'Top 10 by partners',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.partnerCount,
        },

        bars: [
            {
                title: 'Partner count',
                color: tableauColors[3],
                valueSelector: item => item.partnerCount,
            },
        ],
    },
    {
        id: '1.3',
        type: 'bar-chart',
        title: 'Top 10 by sectors',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.sectorCount,
        },

        bars: [
            {
                title: 'Sector count',
                color: tableauColors[4],
                valueSelector: item => item.sectorCount,
            },
        ],
    },
    {
        id: '2',
        type: 'bar-chart',
        title: 'Top 10 by population',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.indicators[25] || null,
        },

        bars: [
            {
                title: 'Population',
                color: tableauColors[5],
                valueSelector: item => item.indicators[25] || null,
            },
        ],
        dependencies: [25],
    },
    {
        id: '3',
        type: 'bar-chart',
        title: 'Top 10 by poverty incidence',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.indicators[132] || null,
        },

        bars: [
            {
                title: 'Poverty Incidence',
                color: tableauColors[6],
                valueSelector: item => item.indicators[132] || null,
            },
        ],
        dependencies: [132],
    },

    /*
    {
        id: '2',
        type: 'pie-chart',
        title: 'Total Budget',
        keySelector: item => item.name,
        valueSelector: item => item.allocatedBudget,
    },
    {
        id: '3',
        type: 'bar-chart',
        title: 'Health and Finance for top 10 by budget',
        keySelector: item => item.name,
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
        id: '4',
        type: 'histogram',
        title: 'Financial Institutions distribution',
        color: tableauColors[0],
        binCount: 10,
        valueSelector: item => item.indicators[118] || 0,
        dependencies: [118],
    },
    {
        id: '5',
        type: 'histogram',
        title: 'Health Facilities distribution',
        color: tableauColors[3],
        binCount: 10,
        valueSelector: item => item.indicators[119] || 0,
        dependencies: [119],
    },
     */
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

    const options: NumericOption<ExtendedFiveW>[] = useMemo(
        () => {
            if (!indicatorList) {
                return staticOptions;
            }
            return [
                ...staticOptions,
                ...indicatorList.map(indicator => ({
                    key: `indicator_${indicator.id}`,
                    title: indicator.fullTitle,
                    // FIXME: zero zero zero
                    valueSelector: (item: ExtendedFiveW) => item.indicators[indicator.id] || 0,

                    category: indicator.category,

                    dependency: indicator.id,
                })),
            ];
        },
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
                <Button
                    onClick={handleModalShow}
                    className={styles.addChartButton}
                    icons={<IoMdAddCircleOutline className={styles.icon} />}
                >
                    <div className={styles.text}>
                        Add Chart
                    </div>
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
                        key={item.id}
                        chartClassName={styles.chart}
                        data={extendedFiveWList}
                        settings={item}
                        onDelete={handleChartDelete}
                        className={styles.polyChart}
                    />
                ))}
            </div>
            {showModal && (
                <ChartModal
                    onClose={handleModalClose}
                    onSave={handleChartAdd}
                    options={options}
                    keySelector={keySelector}
                />
            )}
        </>
    );
}
export default Charts;
