import React, { useMemo, useState, useCallback } from 'react';
import { listToMap, isDefined, unique } from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import Button from '#components/Button';
import Modal from '#components/Modal';
import RegionSelector from '#components/RegionSelector';

import useRequest from '#hooks/useRequest';
import {
    MultiResponse,
    Indicator,
    RegionLevelOption,
} from '#types';

import { apiEndPoint } from '#utils/constants';

import useMapStateForFiveW from '../../useMapStateForFiveW';
import { FiveW } from '../../types';

import PolyChart, { ChartSettings, BarChartSettings } from '../PolyChart';

import styles from './styles.css';

interface IndicatorValue {
    indicatorId: number;
    code: string;
    value: number;
}
interface ExtendedFiveW extends FiveW {
    indicators: {
        [key: number]: number | undefined;
    };
}

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
    indicatorMapping?: {
        [key: string]: Indicator;
    };
    regionLevel: RegionLevelOption;
    onRegionLevelChange: (v: RegionLevelOption) => void;
}

function Charts(props: Props) {
    const {
        programs,
        regionLevel,
        onRegionLevelChange,
        indicatorMapping,
    } = props;

    const [chartSettings, setChartSettings] = useState<ChartSettings<ExtendedFiveW>[]>(
        defaultChartSettings,
    );

    const [showModal, setModalVisibility] = useState(false);

    // Valid indicators for chart
    const indicators = useMemo(
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

    // Get fiveW

    const [
        fiveWListPending,
        _,
        fiveWList,
    ] = useMapStateForFiveW(regionLevel, programs);

    // Get indicator value
    const regionIndicatorOptions: RequestInit | undefined = useMemo(
        () => (indicators.length > 0 ? {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                indicatorId: indicators,
            }),
        } : undefined),
        [indicators],
    );

    let regionIndicatorUrl: string | undefined;
    if (indicators.length > 0) {
        regionIndicatorUrl = `${apiEndPoint}/core/${regionLevel}-indicator/`;
    }
    const [
        regionIndicatorListPending,
        regionIndicatorListResponse,
    ] = useRequest<MultiResponse<IndicatorValue>>(regionIndicatorUrl, 'indicator', regionIndicatorOptions);

    const extendedFiveW: ExtendedFiveW[] | undefined = useMemo(
        () => {
            if (!fiveWList) {
                return undefined;
            }
            const mapping = listToMap(
                regionIndicatorListResponse?.results,
                item => `${item.code}-${item.indicatorId}`,
                item => item.value,
            );
            return fiveWList.map(item => ({
                ...item,
                indicators: listToMap(
                    indicators,
                    id => id,
                    id => mapping[`${item.code}-${id}`],
                ),
            }));
        },
        [fiveWList, regionIndicatorListResponse, indicators],
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
                {(fiveWListPending || regionIndicatorListPending) && (
                    <Backdrop>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                {chartSettings.map(item => (
                    <PolyChart
                        className={styles.chart}
                        key={item.id}
                        data={extendedFiveW}
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
