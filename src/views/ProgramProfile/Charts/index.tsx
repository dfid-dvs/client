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
import useExtendedProgram, { ExtendedProgram } from '#views/Dashboard/useExtendedPrograms';

const keySelector = (item: ExtendedProgram) => item.name;

const staticOptions: NumericOption<ExtendedProgram>[] = [
    {
        key: 'allocatedBudget',
        title: 'Budget Spend',
        valueSelector: item => item.totalBudget,
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
                title: 'Budget Spend',
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

    const indicatorList = useMemo(
        () => indicatorListResponse?.results.filter(
            indicator => indicator.federalLevel === 'all' || indicator.federalLevel === regionLevel,
        ),
        [indicatorListResponse?.results, regionLevel],
    );

    const [chartSettings, setChartSettings] = useState<ChartSettings<ExtendedProgram>[]>();

    const showableChartSettings = useMemo(
        () => {
            if (!hiddenChartIds) {
                return chartSettings;
            }
            return chartSettings?.filter(c => !hiddenChartIds.includes(c.id));
        },
        [chartSettings, hiddenChartIds],
    );


    const showableDefaultChartSettings = useMemo(
        () => {
            if (!hiddenChartIds) {
                return defaultChartSettings;
            }
            return defaultChartSettings.filter(c => !hiddenChartIds.includes(c.id));
        },
        [hiddenChartIds],
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
        (settings: ChartSettings<ExtendedProgram>) => {
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
        [editableChartId, chartSettings, setChartSettings],
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
        [String(selectedProgram)],
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

    const editableChartSettings: ChartSettings<ExtendedProgram> | undefined = useMemo(
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
        [setExpandableDefaultChart],
    );

    const handleDefaultChartCollapse = useCallback(
        () => {
            setExpandableDefaultChart(undefined);
        },
        [setExpandableDefaultChart],
    );

    const expandableDefaultChartSettings = useMemo(
        () => {
            const chartSetting = defaultChartSettings.find(c => c.id === expandableDefaultChart);
            return chartSetting;
        },
        [expandableDefaultChart],
    );

    const [expandableChart, setExpandableChart] = useState<string>();

    const handleChartCollapse = useCallback(
        () => {
            setExpandableChart(undefined);
        },
        [],
    );

    const expandableChartSettings: ChartSettings<ExtendedProgram> | undefined = useMemo(
        () => {
            const chartSetting = chartSettings?.find(c => c.id === expandableChart);
            return chartSetting;
        },
        [chartSettings, expandableChart],
    );

    const onSetEditableChartId = useCallback(
        (id: string | undefined) => {
            setEditableChartId(id);
            onAddModalVisibilityChange(true);
        },
        [onAddModalVisibilityChange],
    );

    const [programsPending, extendedPrograms] = useExtendedProgram([]);
    const loading = indicatorListPending || extendedFiveWPending || programsPending;
    return (
        <div className={_cs(styles.charts, className)}>
            {loading && (
                <Backdrop className={styles.backdrop}>
                    <LoadingAnimation />
                </Backdrop>
            )}
            {showableDefaultChartSettings.map(item => (
                <PolyChart
                    key={item.id}
                    className={styles.chartContainer}
                    chartClassName={styles.chart}
                    hideActions={printMode}
                    data={filteredFiveWData}
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
                    data={extendedPrograms}
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
                    options={staticOptions}
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
                        data={extendedFiveWList}
                        settings={expandableDefaultChartSettings}
                        onDelete={handleAddHideableChartIds}
                        className={styles.polyChart}
                        onExpand={handleDefaultChartExpand}
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
                        data={extendedPrograms}
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

export default ProgramProfileCharts;
