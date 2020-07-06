import React, { useCallback, useState, useMemo, useContext } from 'react';
import {
    _cs,
    isDefined,
    unique,
    listToMap,
    isFalsyString,
} from '@togglecorp/fujs';

import PolyChart from '#components/PolyChart';
import ChartModal from '#components/ChartModal';
import DomainContext from '#components/DomainContext';
import useRequest from '#hooks/useRequest';

import {
    MultiResponse,
    Indicator,
    ChartSettings,
    NumericOption,
    RegionLevelOption,
} from '#types';
import {
    tableauColors,
    apiEndPoint,
} from '#utils/constants';

import useExtendedFiveW, { ExtendedFiveW } from '../../Dashboard/useExtendedFiveW';

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
        title: 'By budget',
        keySelector: item => item.name,
        orientation: 'vertical',

        limit: {
            count: 100,
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
        id: '3',
        type: 'bar-chart',
        title: 'Health and Finance for top 10 by budget',
        keySelector: item => item.name,
        orientation: 'vertical',
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
            count: 100,
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
];

interface Props {
    className?: string;
    showAddModal: boolean;
    printMode: boolean;
    onAddModalVisibilityChange: (value: boolean) => void;
    selectedRegion: number | undefined;
}

function InfographicsCharts(props: Props) {
    const {
        className,
        showAddModal,
        onAddModalVisibilityChange,
        printMode,
        selectedRegion,
    } = props;

    const {
        regionLevel,
        programs,
    } = useContext(DomainContext);

    const indicatorListGetUrl = `${apiEndPoint}/core/indicator-list/?is_dashboard=true`;
    const [
        indicatorListPending,
        indicatorListResponse,
    ] = useRequest<MultiResponse<Indicator>>(indicatorListGetUrl, 'indicator-list');

    const indicatorList = indicatorListResponse?.results.filter(
        indicator => indicator.federalLevel === 'all' || indicator.federalLevel === regionLevel,
    );

    const [chartSettings, setChartSettings] = useState<ChartSettings<ExtendedFiveW>[]>(
        defaultChartSettings,
    );

    const handleModalClose = useCallback(() => {
        onAddModalVisibilityChange(false);
    }, [onAddModalVisibilityChange]);

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

    const indicatorMapping = useMemo(
        () => listToMap(
            indicatorList,
            item => item.id,
            item => item,
        ),
        [indicatorList],
    );

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

    const {
        subsequentRegionLevel,
        extraUrlParams,
    } = useMemo(() => {
        if (regionLevel === 'province') {
            return {
                subsequentRegionLevel: 'district',
                extraUrlParams: {
                    // eslint-disable-next-line @typescript-eslint/camelcase
                    province_id: selectedRegion,
                },
            };
        }
        if (regionLevel === 'district') {
            return {
                subsequentRegionLevel: 'municipality',
                extraUrlParams: {
                    // eslint-disable-next-line @typescript-eslint/camelcase
                    district_id: selectedRegion,
                },
            };
        }
        return {
            subsequentRegionLevel: regionLevel,
        };
    }, [selectedRegion, regionLevel]);

    const [extendedFiveWPending, extendedFiveWList] = useExtendedFiveW(
        subsequentRegionLevel as RegionLevelOption,
        programs,
        validSelectedIndicators,
        true,
        extraUrlParams,
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

    if (indicatorListPending || extendedFiveWPending) {
        return null;
    }

    return (
        <div className={_cs(styles.charts, className)}>
            {chartSettings.map(item => (
                <PolyChart
                    key={item.id}
                    className={styles.chartContainer}
                    chartClassName={styles.chart}
                    hideActions={printMode}
                    data={extendedFiveWList}
                    settings={item}
                    onDelete={handleChartDelete}
                />
            ))}
            {showAddModal && (
                <ChartModal
                    onClose={handleModalClose}
                    onSave={handleChartAdd}
                    options={options}
                    keySelector={keySelector}
                />
            )}
        </div>
    );
}

export default InfographicsCharts;
