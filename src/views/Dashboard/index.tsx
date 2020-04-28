import React from 'react';
import { _cs } from '@togglecorp/fujs';

import RegionSelector from '#components/RegionSelector';
import NavbarContext from '#components/NavbarContext';
import SegmentInput from '#components/SegmentInput';
import SelectInput from '#components/SelectInput';
import ChoroplethLegend from '#components/ChoroplethLegend';
import Backdrop from '#components/Backdrop';
import LoadingAnimation from '#components/LoadingAnimation';
import IndicatorMap from '#components/IndicatorMap';

import useRequest from '#hooks/useRequest';
import useMapStateForIndicator from '#hooks/useMapStateForIndicator';
import useMapStateForFiveW from '#hooks/useMapStateForFiveW';

import { generateChoroplethMapPaintAndLegend } from '#utils/common';
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

type Attribute = 'indicator' | 'fiveW';

interface AttributeOption {
    key: Attribute;
    label: string;
}

const attributeOptions: AttributeOption[] = [
    {
        key: 'fiveW',
        label: 'DFID Data',
    },
    {
        key: 'indicator',
        label: 'Indicator',
    },
];

const attributeKeySelector = (option: AttributeOption) => option.key;
const attributeLabelSelector = (option: AttributeOption) => option.label;

interface Props {
    className?: string;
}

const Dashboard = (props: Props) => {
    const { className } = props;
    const { regionLevel } = React.useContext(NavbarContext);

    const [
        selectedIndicator,
        setSelectedIndicator,
    ] = React.useState<number | undefined>(undefined);

    const [
        selectedFiveWOption,
        setFiveWOption,
    ] = React.useState<FiveWOptionKey | undefined>('allocatedBudget');

    const [
        selectedAttribute,
        setAttribute,
    ] = React.useState<'indicator' | 'fiveW'>('fiveW');

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
    const mapState = selectedAttribute === 'indicator' ? indicatorMapState : fiveWMapState;
    const {
        paint: mapPaint,
        legend: mapLegend,
        min: dataMinValue,
    } = React.useMemo(
        () => {
            const valueList = mapState.map(d => d.value);

            const min = Math.min(...valueList);
            const max = Math.max(...valueList);

            return {
                min,
                ...generateChoroplethMapPaintAndLegend(colorDomain, min, max),
            };
        },
        [mapState],
    );

    // const pending = mapStatePending || indicatorListPending;

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
                mapState={mapState}
                mapPaint={mapPaint}
            />
            <div className={styles.mapStyleConfigContainer}>
                <RegionSelector
                    searchHidden
                />
                <SegmentInput
                    options={attributeOptions}
                    onChange={setAttribute}
                    value={selectedAttribute}
                    optionLabelSelector={attributeLabelSelector}
                    optionKeySelector={attributeKeySelector}
                />
                { selectedAttribute === 'indicator' && (
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
                )}
                { selectedAttribute === 'fiveW' && (
                    <SelectInput
                        label="Selected attribute"
                        className={styles.fiveWSegmentInput}
                        options={fiveWOptions}
                        onChange={setFiveWOption}
                        value={selectedFiveWOption}
                        optionLabelSelector={fiveWLabelSelector}
                        optionKeySelector={fiveWKeySelector}
                    />
                )}
                {Object.keys(mapLegend).length > 0 && (
                    <ChoroplethLegend
                        className={styles.legend}
                        minValue={dataMinValue}
                        legend={mapLegend}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
