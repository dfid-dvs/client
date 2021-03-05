import React, { useCallback, useState, useMemo, useContext } from 'react';
import {
    _cs,
    isDefined,
    unique,
    listToMap,
    isFalsyString,
} from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
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

    const subsequentRegionLevel: RegionLevelOption | undefined = (
        (regionLevel === 'province' && 'district')
        || (regionLevel === 'district' && 'municipality')
        || undefined
    );

    const extraUrlParams = {
        // eslint-disable-next-line @typescript-eslint/camelcase
        province_id: regionLevel === 'province' ? selectedRegion : undefined,
        // eslint-disable-next-line @typescript-eslint/camelcase
        district_id: regionLevel === 'district' ? selectedRegion : undefined,
    };

    const [extendedFiveWPending, extendedFiveWList] = useExtendedFiveW(
        subsequentRegionLevel,
        // eslint-disable-next-line max-len
        // passing markerId ,submarkerId ,programId ,componentId ,partnerId ,sectorId ,subsectorId as undefined
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
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

    return (
        <div className={_cs(styles.charts, className)}>
            {(indicatorListPending || extendedFiveWPending) && (
                <Backdrop className={styles.backdrop}>
                    <LoadingAnimation />
                </Backdrop>
            )}
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
