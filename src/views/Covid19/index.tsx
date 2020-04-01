import React from 'react';
import { _cs } from '@togglecorp/fujs';

import NavbarContext from '#components/NavbarContext';
import SelectInput from '#components/SelectInput';
import ChoroplethLegend from '#components/ChoroplethLegend';
import Backdrop from '#components/Backdrop';
import LoadingAnimation from '#components/LoadingAnimation';

import IndicatorMap from '#components/IndicatorMap';

import {
    useRequest,
    useMapState,
} from '#hooks';

import { generateChoroplethMapPaintAndLegend } from '#utils/common';
import { colorDomain } from '#utils/constants';

import styles from './styles.css';

interface MapState {
    id: number;
    value: number;
}

interface Indicator {
    id: number;
    fullTitle: string;
}

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

    const indicatorListGetUrl = 'http://139.59.67.104:8060/api/v1/core/indicator-list/?is_covid=1';
    const [
        indicatorListPending,
        indicatorListResponse,
    ] = useRequest<Indicator>(indicatorListGetUrl);

    const [mapStatePending, mapState] = useMapState(regionLevel, selectedIndicator);

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
            styles.covid19,
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
                    options={indicatorListResponse.results}
                    onChange={setSelectedIndicator}
                    value={selectedIndicator}
                    optionLabelSelector={d => d.fullTitle}
                    optionKeySelector={d => d.id}
                />
                { Object.keys(mapLegend).length > 0 && (
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
