import React, { useMemo, useContext, useState } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import RegionSelector from '#components/RegionSelector';
import NavbarContext from '#components/NavbarContext';
import ToggleButton from '#components/ToggleButton';
import SelectInput from '#components/SelectInput';
import ChoroplethLegend from '#components/ChoroplethLegend';
import IndicatorMap from '#components/IndicatorMap';

import useRequest from '#hooks/useRequest';
import useMapStateForIndicator from '#hooks/useMapStateForIndicator';
import useMapStateForFiveW from '#hooks/useMapStateForFiveW';

import {
    generateChoroplethMapPaintAndLegend,
    generateBubbleMapPaintAndLegend,
} from '#utils/common';
import {
    MultiResponse,
    FiveWOptionKey,
} from '#types';

import {
    colorDomain,
    apiEndPoint,
} from '#utils/constants';

import styles from './styles.css';

// FIXME: use from typings
interface MapState {
    id: number;
    value: number;
}

// FIXME: use from typings
interface Indicator {
    id: number;
    fullTitle: string;
    abstract: string | undefined;
    category: string;
}

interface FiveWOption {
    key: FiveWOptionKey;
    label: string;
}

const fiveWOptions: FiveWOption[] = [
    {
        key: 'allocatedBudget',
        label: 'Allocated Budget',
    },
    {
        key: 'maleBeneficiary',
        label: 'Male Beneficiary',
    },
    {
        key: 'femaleBeneficiary',
        label: 'Female Beneficiary',
    },
    {
        key: 'totalBeneficiary',
        label: 'Total Beneficiary',
    },
];

const fiveWKeySelector = (option: FiveWOption) => option.key;
const fiveWLabelSelector = (option: FiveWOption) => option.label;

const indicatorKeySelector = (indicator: Indicator) => indicator.id;
const indicatorLabelSelector = (indicator: Indicator) => indicator.fullTitle;
const indicatorGroupKeySelector = (indicator: Indicator) => indicator.category;

interface Props {
    className?: string;
}

const Dashboard = (props: Props) => {
    const { className } = props;
    const { regionLevel } = useContext(NavbarContext);

    const [
        selectedIndicator,
        setSelectedIndicator,
    ] = useState<number | undefined>(undefined);

    const [
        selectedFiveWOption,
        setFiveWOption,
    ] = useState<FiveWOptionKey | undefined>('allocatedBudget');

    const [invertMapStyle, setInvertMapStyle] = useState(false);

    const indicatorListGetUrl = `${apiEndPoint}/core/indicator-list/`;
    const [
        indicatorListPending,
        indicatorListResponse,
    ] = useRequest<MultiResponse<Indicator>>(indicatorListGetUrl);

    const [
        indicatorMapStatePending,
        indicatorMapState,
    ] = useMapStateForIndicator(regionLevel, selectedIndicator, undefined);

    const [
        fiveWMapStatePending,
        fiveWMapState,
    ] = useMapStateForFiveW(regionLevel, selectedFiveWOption);

    // const mapStatePending = indicatorMapStatePending || fiveWMapStatePending;

    const {
        choroplethMapState,
        bubbleMapState,
    } = useMemo(() => {
        if (invertMapStyle) {
            return {
                choroplethMapState: indicatorMapState,
                bubbleMapState: fiveWMapState,
            };
        }
        return {
            choroplethMapState: fiveWMapState,
            bubbleMapState: indicatorMapState,
        };
    }, [invertMapStyle, indicatorMapState, fiveWMapState]);

    const {
        paint: mapPaint,
        legend: mapLegend,
        min: dataMinValue,
    } = useMemo(
        () => {
            const valueList = choroplethMapState.filter(d => isDefined(d.value)).map(d => d.value);

            const min = Math.min(...valueList);
            const max = Math.max(...valueList);

            return generateChoroplethMapPaintAndLegend(colorDomain, min, max);
        },
        [choroplethMapState],
    );

    // const pending = mapStatePending || indicatorListPending;
    const {
        mapPaint: bubblePaint,
        mapLegend: bubbleLegend,
    } = useMemo(() => {
        const valueList = bubbleMapState
            .filter(d => isDefined(d.value)).map(d => Math.abs(d.value));

        const min = valueList.length > 0 ? Math.min(...valueList) : undefined;
        const max = valueList.length > 0 ? Math.max(...valueList) : undefined;

        let maxRadius = 50;
        if (regionLevel === 'district') {
            maxRadius = 40;
        } else if (regionLevel === 'municipality') {
            maxRadius = 30;
        }

        return generateBubbleMapPaintAndLegend(min, max, maxRadius);
    }, [bubbleMapState, regionLevel]);

    return (
        <div className={_cs(
            styles.dashboard,
            className,
        )}
        >
            {/* pending && (
                <Backdrop className={styles.backdrop}>
                    <LoadingAnimation />
                </Backdrop>
            ) */}
            <IndicatorMap
                className={styles.mapContainer}
                regionLevel={regionLevel}
                choroplethMapState={choroplethMapState}
                choroplethMapPaint={mapPaint}
                bubbleMapState={bubbleMapState}
                bubbleMapPaint={bubblePaint}
            />
            <div className={styles.mapStyleConfigContainer}>
                <RegionSelector searchHidden />
                <h4>DFID Data</h4>
                <SelectInput
                    className={styles.indicatorSelectInput}
                    disabled={indicatorListPending}
                    options={indicatorListResponse?.results}
                    onChange={setSelectedIndicator}
                    value={selectedIndicator}
                    optionLabelSelector={indicatorLabelSelector}
                    optionKeySelector={indicatorKeySelector}
                    groupKeySelector={indicatorGroupKeySelector}
                />
                <h4>Indicator</h4>
                <SelectInput
                    className={styles.fiveWSegmentInput}
                    options={fiveWOptions}
                    onChange={setFiveWOption}
                    value={selectedFiveWOption}
                    optionLabelSelector={fiveWLabelSelector}
                    optionKeySelector={fiveWKeySelector}
                />
                <ToggleButton
                    label="Toggle Choropleth/Bubble"
                    value={invertMapStyle}
                    onChange={setInvertMapStyle}
                />
                {Object.keys(mapLegend).length > 0 && (
                    <div className={styles.stats}>
                        <h4>Legend</h4>
                        <ChoroplethLegend
                            className={styles.legend}
                            minValue={dataMinValue}
                            legend={mapLegend}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
