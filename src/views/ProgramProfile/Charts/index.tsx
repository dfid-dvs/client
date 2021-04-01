import React, { useCallback, useState, useMemo, useContext } from 'react';
import {
    _cs,
    isDefined,
    unique,
    listToMap,
    compareNumber,
} from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import PolyChart from '#components/PolyChart';
import ChartModal from '#components/ChartModal';
import DomainContext from '#components/DomainContext';
import useRequest from '#hooks/useRequest';
import Modal from '#components/Modal';

import useExtendedFiveW, { ExtendedFiveW } from '#views/Dashboard/useExtendedFiveW';

import {
    MultiResponse,
    Indicator,
    ChartSettings,
    NumericOption,
} from '#types';
import {
    tableauColors,
    apiEndPoint,
} from '#utils/constants';

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
        title: 'Priority region by budget spent',
        keySelector: item => item.name,

        limit: {
            count: 10,
            method: 'max',
            valueSelector: item => item.allocatedBudget,
        },

        bars: [
            {
                key: 'allocatedBudget',
                title: 'Allocated Budget',
                color: tableauColors[1],
                valueSelector: item => item.allocatedBudget,
            },
        ],
    },
];

interface Props {
    className?: string;
    showAddModal: boolean;
    printMode: boolean;
    onAddModalVisibilityChange: (value: boolean) => void;
    selectedProgram: number | undefined;
    hiddenChartIds: string[] | undefined;
    handleAddHideableChartIds: (id: string | undefined) => void;
}

function ProgramProfileCharts(props: Props) {
    const {
        className,
        showAddModal,
        onAddModalVisibilityChange,
        printMode,
        selectedProgram,
        hiddenChartIds,
        handleAddHideableChartIds,
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

    const showableChartSettings = useMemo(
        () => {
            if (!hiddenChartIds) {
                return chartSettings;
            }
            return chartSettings.filter(c => !hiddenChartIds.includes(c.id));
        },
        [chartSettings, hiddenChartIds],
    );

    const [editableChartId, setEditableChartId] = useState<string>();

    const handleModalClose = useCallback(() => {
        onAddModalVisibilityChange(false);
        setEditableChartId(undefined);
    }, [onAddModalVisibilityChange, setEditableChartId]);

    const handleChartAdd = useCallback(
        (settings: ChartSettings<ExtendedFiveW>) => {
            if (!editableChartId) {
                setChartSettings(currentChartSettings => [
                    ...currentChartSettings,
                    settings,
                ]);
            }
            const tmpChartSettings = [...chartSettings];
            const chartIndex = tmpChartSettings.findIndex(c => c.id === editableChartId);
            if (chartIndex <= -1) {
                return;
            }
            tmpChartSettings.splice(chartIndex, 1, settings);
            setChartSettings(tmpChartSettings);
        },
        [editableChartId],
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

    const [extendedFiveWPending, extendedFiveWList] = useExtendedFiveW(
        regionLevel,
        // eslint-disable-next-line max-len
        // passing markerId ,submarkerId ,programId ,componentId ,partnerId ,sectorId ,subsectorId as undefined
        undefined,
        undefined,
        [String(selectedProgram)],
        undefined,
        undefined,
        undefined,
        undefined,
        validSelectedIndicators,
    );

    const filteredFiveWData = extendedFiveWList
        .filter(data => data.allocatedBudget > 0)
        .sort((foo, bar) => compareNumber(
            foo.allocatedBudget,
            bar.allocatedBudget,
            1,
        ))
        .slice(0, 10);

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

    const editableChartSettings: ChartSettings<ExtendedFiveW> | undefined = useMemo(
        () => {
            const chartSetting = chartSettings.find(c => c.id === editableChartId);
            if (!chartSetting) {
                return undefined;
            }

            return chartSetting;
        },
        [chartSettings, editableChartId],
    );

    const [expandableChart, setExpandableChart] = useState<string>();

    const handleChartExpand = useCallback(
        (id: string | undefined) => {
            setExpandableChart(id);
        },
        [setExpandableChart],
    );

    const handleChartCollapse = useCallback(
        () => {
            setExpandableChart(undefined);
        },
        [setExpandableChart],
    );

    const expandableChartSettings: ChartSettings<ExtendedFiveW> | undefined = useMemo(
        () => {
            const chartSetting = chartSettings.find(c => c.id === expandableChart);
            if (!chartSetting) {
                return undefined;
            }
            return chartSetting;
        },
        [chartSettings, expandableChart],
    );

    return (
        <div className={_cs(styles.charts, className)}>
            {(indicatorListPending || extendedFiveWPending) && (
                <Backdrop className={styles.backdrop}>
                    <LoadingAnimation />
                </Backdrop>
            )}
            {showableChartSettings.map(item => (
                <PolyChart
                    key={item.id}
                    className={styles.chartContainer}
                    chartClassName={styles.chart}
                    hideActions={printMode}
                    data={filteredFiveWData}
                    settings={item}
                    onDelete={handleAddHideableChartIds}
                    onExpand={handleChartExpand}
                    chartExpanded={expandableChart}
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
                        onExpand={handleChartExpand}
                        chartExpanded={expandableChart}
                    />
                </Modal>
            )}
        </div>
    );
}

export default ProgramProfileCharts;
