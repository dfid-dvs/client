import React from 'react';
import { _cs } from '@togglecorp/fujs';

import NavbarContext from '#components/NavbarContext';
import SelectInput from '#components/SelectInput';
import ChoroplethLegend from '#components/ChoroplethLegend';
import Backdrop from '#components/Backdrop';
import LoadingAnimation from '#components/LoadingAnimation';
import IndicatorMap from '#components/IndicatorMap';

import useRequest from '#hooks/useRequest';
import useMapStateForIndicator from '#hooks/useMapStateForIndicator';

import { generateChoroplethMapPaintAndLegend } from '#utils/common';
import { MultiResponse } from '#types';
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
}

const indicatorKeySelector = (indicator: Indicator) => indicator.id;
const indicatorLabelSelector = (indicator: Indicator) => indicator.fullTitle;

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

    const indicatorListGetUrl = `${apiEndPoint}/indicator-list/`;
    const [
        indicatorListPending,
        indicatorListResponse,
    ] = useRequest<MultiResponse<Indicator>>(indicatorListGetUrl);

    const [
        mapStatePending,
        mapState,
    ] = useMapStateForIndicator(regionLevel, selectedIndicator, undefined);

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

    const pending = mapStatePending || indicatorListPending;

    return (
        <div className={_cs(
            styles.dashboard,
            className,
        )}
        >
            { pending && (
                <Backdrop className={styles.backdrop}>
                    <LoadingAnimation />
                </Backdrop>
            )}
            <IndicatorMap
                className={styles.mapContainer}
                regionLevel={regionLevel}
                mapState={mapState}
                mapPaint={mapPaint}
            />
            <div className={styles.mapStyleConfigContainer}>
                <h4 className={styles.heading}>
                    Indicator
                </h4>
                <SelectInput
                    className={styles.indicatorSelectInput}
                    disabled={indicatorListPending}
                    options={indicatorListResponse?.results}
                    onChange={setSelectedIndicator}
                    value={selectedIndicator}
                    optionLabelSelector={indicatorLabelSelector}
                    optionKeySelector={indicatorKeySelector}
                />
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
