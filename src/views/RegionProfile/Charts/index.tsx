import React, { useCallback, useState, useMemo, useContext } from 'react';
import { compareNumber, isDefined, listToMap, unique, _cs } from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import PolyChart from '#components/PolyChart';
import ChartModal from '#components/ChartModal';
import Modal from '#components/Modal';

import {
    ChartSettings,
    Indicator,
    MultiResponse,
    NumericOption,
} from '#types';

import useExtendedFiveW, { ExtendedFiveW } from '#views/Dashboard/useExtendedFiveW';

import styles from './styles.css';
import { apiEndPoint } from '#utils/constants';
import useRequest from '#hooks/useRequest';
import domainContext from '#components/DomainContext';

const keySelector = (item: ExtendedFiveW) => item.name;

const staticOptions: NumericOption<ExtendedFiveW>[] = [
    {
        key: 'allocatedBudget',
        title: 'Budget Spend',
        valueSelector: item => item.allocatedBudget,
        category: 'BEK Data',
    },
    {
        key: 'programCount',
        title: 'Programs',
        valueSelector: item => item.programCount,
        category: 'BEK Data',
    },
    {
        key: 'componentCount',
        title: 'Components',
        valueSelector: item => item.componentCount,
        category: 'BEK Data',
    },
    {
        key: 'partnerCount',
        title: 'Partners',
        valueSelector: item => item.partnerCount,
        category: 'BEK Data',
    },
    {
        key: 'sectorCount',
        title: 'Sectors',
        valueSelector: item => item.sectorCount,
        category: 'BEK Data',
    },
];


interface ProfileChartData {
    name: string;
    key: string;
    id: number;
    value: number;
}

const defaultChartSettings: ChartSettings<ProfileChartData>[] = [
    {
        id: 'topProgramByBudget',
        type: 'bar-chart',
        title: 'Top Program by Budget',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.value,
        },

        bars: [
            {
                key: 'totalBudget',
                title: 'Total Budget',
                color: '#4C6AA9',
                valueSelector: item => item.value,
            },
        ],
    },
    {
        id: 'activeSectors',
        type: 'pie-chart',
        title: 'Top Sectors by Budget',
        key: 'totalBudget',
        keySelector: item => item.name,
        valueSelector: item => item.value,
    },
    {
        id: 'topPartnerByBudget',
        type: 'bar-chart',
        title: 'Top Partner by Budget',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.value,
        },

        bars: [
            {
                key: 'totalBudget',
                title: 'Total Budget',
                color: '#4C6AA9',
                valueSelector: item => item.value,
            },
        ],
    },

    {
        id: 'topSectorByNoOfPartner',
        type: 'bar-chart',
        title: 'Top Sectors by number of partners',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.value,
        },

        bars: [
            {
                key: 'partnerCount',
                title: 'Partner Count',
                color: '#4C6AA9',
                valueSelector: item => item.value,
            },
        ],
    },
];

interface Props {
    className?: string;
    showAddModal: boolean;
    printMode: boolean;
    onAddModalVisibilityChange: (value: boolean) => void;
    activeSectors: ProfileChartData[] | undefined;
    topProgramByBudget: ProfileChartData[] | undefined;
    topPartnerByBudget: ProfileChartData[] | undefined;
    topSectorByNoOfPartner: ProfileChartData[] | undefined;
    hiddenChartIds: string[] | undefined;
    handleAddHideableChartIds: (id: string | undefined) => void;
}

function RegionalProfileCharts(props: Props) {
    const {
        className,
        showAddModal,
        onAddModalVisibilityChange,
        printMode,
        activeSectors,
        topProgramByBudget,
        topPartnerByBudget,
        topSectorByNoOfPartner,
        hiddenChartIds,
        handleAddHideableChartIds,
    } = props;
    const [
        chartSettings,
        setChartSettings,
    ] = useState<ChartSettings<ExtendedFiveW>[]>();

    const showableChartSettings = useMemo(
        () => {
            if (!hiddenChartIds) {
                return chartSettings;
            }
            return chartSettings?.filter(c => !hiddenChartIds.includes(c.id));
        },
        [chartSettings, hiddenChartIds],
    );

    const [editableChartId, setEditableChartId] = useState<string | undefined>();

    const handleModalClose = useCallback(
        () => {
            onAddModalVisibilityChange(false);
            setEditableChartId(undefined);
        },
        [onAddModalVisibilityChange],
    );

    const handleChartAdd = useCallback(
        (settings: ChartSettings<ExtendedFiveW>) => {
            if (!editableChartId) {
                setChartSettings((currentChartSettings) => {
                    if (!currentChartSettings) {
                        return [settings];
                    }
                    return [
                        ...currentChartSettings,
                        settings,
                    ];
                });
            }
            if (!chartSettings) {
                return;
            }
            const tmpChartSettings = [...chartSettings];
            const chartIndex = tmpChartSettings.findIndex(c => c.id === editableChartId);
            if (chartIndex <= -1) {
                return;
            }
            tmpChartSettings.splice(chartIndex, 1, settings);
            setChartSettings(tmpChartSettings);
        },
        [editableChartId, chartSettings],
    );

    const {
        regionLevel,
    } = useContext(domainContext);

    const indicatorListGetUrl = `${apiEndPoint}/core/indicator-list/?is_dashboard=true`;
    const [
        indicatorListPending,
        indicatorListResponse,
    ] = useRequest<MultiResponse<Indicator>>(indicatorListGetUrl, 'indicator-list');

    const indicatorList = indicatorListResponse?.results.filter(
        indicator => indicator.federalLevel === 'all' || indicator.federalLevel === regionLevel,
    );

    const indicatorMapping = useMemo(
        () => listToMap(
            indicatorList,
            item => item.id,
            item => item,
        ),
        [indicatorList],
    );

    const validSelectedIndicators = useMemo(() => {
        if (!chartSettings) {
            return [];
        }
        return unique(
            [...chartSettings
                .map(item => item.dependencies)
                .filter(isDefined)
                .flat(),
            ].filter(i => !!indicatorMapping[i]),
            item => item,
        ).sort();
    }, [chartSettings, indicatorMapping]);

    const [extendedFiveWPending, extendedFiveWList] = useExtendedFiveW(
        regionLevel,
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
    );

    const filteredFiveWData = useMemo(
        () => extendedFiveWList
            .filter(data => data.allocatedBudget > 0)
            .sort((foo, bar) => compareNumber(
                foo.allocatedBudget,
                bar.allocatedBudget,
                1,
            ))
            .slice(0, 10),
        [extendedFiveWList],
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

    const editableChartSettings = useMemo(
        () => {
            const chartSetting = chartSettings?.find(c => c.id === editableChartId);
            return chartSetting;
        },
        [chartSettings, editableChartId],
    );

    const [expandableDefaultChart, setExpandableDefaultChart] = useState<string>();
    const handleDefaultChartExpand = useCallback(
        (id: string | undefined) => {
            setExpandableDefaultChart(id);
        },
        [],
    );

    const handleDefaultChartCollapse = useCallback(
        () => {
            setExpandableDefaultChart(undefined);
        },
        [],
    );

    const [expandableChart, setExpandableChart] = useState<string>();

    const onSetEditableChartId = useCallback(
        (id: string | undefined) => {
            setEditableChartId(id);
            onAddModalVisibilityChange(true);
        },
        [onAddModalVisibilityChange],
    );

    const handleChartCollapse = useCallback(
        () => setExpandableChart(undefined),
        [],
    );

    const defaultChartData = {
        activeSectors,
        topProgramByBudget,
        topPartnerByBudget,
        topSectorByNoOfPartner,
    };

    const expandableChartSettings = useMemo(
        () => {
            const chartSetting = chartSettings?.find(c => c.id === expandableChart);
            return chartSetting;
        },
        [chartSettings, expandableChart],
    );

    const expandableDefaultChartSettings = useMemo(
        () => (
            defaultChartSettings.find(c => c.id === expandableDefaultChart)
        ),
        [expandableDefaultChart],
    );

    const loading = extendedFiveWPending || indicatorListPending;

    return (
        <div className={_cs(styles.charts, className)}>
            {loading && (
                <Backdrop className={styles.backdrop}>
                    <LoadingAnimation />
                </Backdrop>
            )}
            {defaultChartSettings.map(item => (
                <PolyChart
                    key={item.id}
                    className={styles.chartContainer}
                    chartClassName={styles.chart}
                    hideActions={printMode}
                    data={defaultChartData[item.id]}
                    settings={item}
                    onDelete={handleAddHideableChartIds}
                    onExpand={handleDefaultChartExpand}
                    chartExpanded={expandableDefaultChart}
                    longTilesShown
                />
            ))}
            {showableChartSettings?.map(item => (
                <PolyChart
                    key={item.id}
                    className={styles.chartContainer}
                    chartClassName={styles.chart}
                    hideActions={printMode}
                    data={filteredFiveWData}
                    settings={item}
                    onDelete={handleAddHideableChartIds}
                    onExpand={setExpandableChart}
                    chartExpanded={expandableChart}
                    onSetEditableChartId={onSetEditableChartId}
                    longTilesShown
                />
            ))}
            {showAddModal && (
                <ChartModal
                    onClose={handleModalClose}
                    onSave={handleChartAdd}
                    options={options}
                    keySelector={keySelector}
                    editableChartSettings={editableChartSettings}
                />
            )}
            {expandableDefaultChart && expandableDefaultChartSettings && (
                <Modal
                    onClose={handleDefaultChartCollapse}
                    className={styles.modalChart}
                    header={expandableDefaultChartSettings.title}
                    headerClassName={styles.header}
                >
                    <PolyChart
                        chartClassName={styles.chart}
                        data={defaultChartData[expandableDefaultChart]}
                        settings={expandableDefaultChartSettings}
                        onDelete={handleAddHideableChartIds}
                        className={styles.polyChart}
                        onExpand={handleDefaultChartCollapse}
                        chartExpanded={expandableDefaultChart}
                        longTilesShown
                    />
                </Modal>
            )}
            {expandableChart && expandableChartSettings && (
                <Modal
                    onClose={handleChartCollapse}
                    className={styles.modalChart}
                    header={expandableChartSettings.title}
                    headerClassName={styles.header}
                >
                    <PolyChart
                        chartClassName={styles.chart}
                        data={extendedFiveWList}
                        settings={expandableChartSettings}
                        onDelete={handleAddHideableChartIds}
                        className={styles.polyChart}
                        onExpand={setExpandableChart}
                        chartExpanded={expandableChart}
                        longTilesShown
                    />
                </Modal>
            )}
        </div>
    );
}

export default RegionalProfileCharts;
