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
import BubbleLegend from '#components/BubbleLegend';
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
    LegendItem,
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

const legendKeySelector = (option: LegendItem) => option.radius;
const legendValueSelector = (option: LegendItem) => option.value;
const legendRadiusSelector = (option: LegendItem) => option.radius;

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
    const indicatorList = indicatorListResponse?.results;

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
        choroplethTitle,
        bubbleTitle,
    } = useMemo(() => {
        const indicator = indicatorList?.find(i => indicatorKeySelector(i) === selectedIndicator);
        const indicatorTitle = indicator && indicatorLabelSelector(indicator);
        const fiveW = fiveWOptions.find(i => fiveWKeySelector(i) === selectedFiveWOption);
        const fiveWTitle = fiveW && fiveWLabelSelector(fiveW);

        if (invertMapStyle) {
            return {
                choroplethMapState: indicatorMapState,
                choroplethTitle: indicatorTitle,
                bubbleMapState: fiveWMapState,
                bubbleTitle: fiveWTitle,
            };
        }
        return {
            choroplethMapState: fiveWMapState,
            choroplethTitle: fiveWTitle,
            bubbleMapState: indicatorMapState,
            bubbleTitle: indicatorTitle,
        };
    }, [
        invertMapStyle,
        indicatorMapState,
        fiveWMapState,
        selectedIndicator,
        selectedFiveWOption,
        indicatorList,
    ]);

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
        legend: bubbleLegend,
    } = useMemo(() => {
        const valueList = bubbleMapState
            .map(d => d.value)
            .filter(isDefined)
            .map(Math.abs);

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
                <h4>Indicator</h4>
                <SelectInput
                    className={styles.indicatorSelectInput}
                    disabled={indicatorListPending}
                    options={indicatorList}
                    onChange={setSelectedIndicator}
                    value={selectedIndicator}
                    optionLabelSelector={indicatorLabelSelector}
                    optionKeySelector={indicatorKeySelector}
                    groupKeySelector={indicatorGroupKeySelector}
                />
                <h4>DFID Data</h4>
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
            </div>
            {(bubbleLegend.length > 0 || Object.keys(mapLegend).length > 0) && (
                <div className={styles.legendContainer}>
                    <ChoroplethLegend
                        title={choroplethTitle}
                        className={styles.choroplethLegend}
                        minValue={dataMinValue}
                        legend={mapLegend}
                    />
                    <BubbleLegend
                        className={styles.legend}
                        title={bubbleTitle}
                        data={bubbleLegend}
                        keySelector={legendKeySelector}
                        valueSelector={legendValueSelector}
                        radiusSelector={legendRadiusSelector}
                    />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
