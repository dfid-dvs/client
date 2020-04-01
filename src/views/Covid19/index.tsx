import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { GoLinkExternal } from 'react-icons/go';

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

const StatOutput = ({
    label,
    value,
}) => (
    <div className={styles.statOutput}>
        <div className={styles.value}>
            { value }
        </div>
        <div className={styles.label}>
            { label }
        </div>
    </div>
);

const ExternalLink = ({
    link,
    label,
}) => (
    <a
        href={link}
        className={styles.externalLink}
        target="_blank"
        rel="noopener noreferrer"
    >
        <GoLinkExternal className={styles.icon} />
        <div className={styles.label}>
            { label }
        </div>
    </a>
);

const Covid19 = (props: Props) => {
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

    const [
        statusPending,
        status,
    ] = useRequest('https://nepalcorona.info/api/v1/data/nepal');

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

    const pending = mapStatePending || indicatorListPending || statusPending;

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
            <div className={styles.statusContainer}>
                <h4 className={styles.heading}>
                    Overall status
                </h4>
                {status && (
                    <>
                        <div className={styles.content}>
                            <StatOutput
                                label="Tests performed"
                                value={status.tested_total}
                            />
                            <StatOutput
                                label="Tested positive"
                                value={status.tested_positive}
                            />
                            <StatOutput
                                label="Tested negative"
                                value={status.tested_negative}
                            />
                            <StatOutput
                                label="In isolation"
                                value={status.in_isolation}
                            />
                            <StatOutput
                                label="Deaths"
                                value={status.deaths}
                            />
                        </div>
                        <div className={styles.footer}>
                            <ExternalLink
                                link={status.source}
                                label="Source"
                            />
                            <ExternalLink
                                link={status.latest_sit_report
                                    ? status.latest_sit_report.url
                                    : undefined
                                }
                                label="Latest situation report"
                            />
                        </div>
                    </>
                )}
            </div>
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

export default Covid19;
