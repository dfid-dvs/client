import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Map from '#remap';
import MapContainer from '#remap/MapContainer';
import MapSource from '#remap/MapSource';
import MapTooltip from '#remap/MapTooltip';

import ProvinceLayer from '#components/ProvinceLayer';
import DistrictLayer from '#components/DistrictLayer';
import MunicipalityLayer from '#components/MunicipalityLayer';

import styles from './styles.css';

import {
    mapOptions,
    tooltipOptions,
} from '#utils/constants';

interface Props {
    className?: string;
}

interface HoveredRegion {
    feature: {} | undefined;
    lngLat: number[] | undefined;
}

const undefinedHoveredRegion: HoveredRegion = {
    feature: undefined,
    lngLat: undefined,
};

const Tooltip = ({
    feature,
}: { feature: HoveredRegion }) => {
    if (!feature) {
        return null;
    }

    return (
        <div className={styles.tooltip}>
            <div className={styles.regionTitle}>
                { feature.properties.name }
            </div>
            { feature.state && (
                <div className={styles.value}>
                    { feature.state.value }
                </div>
            )}
        </div>
    );
};

function IndicatorMap(props: Props) {
    const {
        className,
        regionLevel,
        mapState,
        mapPaint,
        children,
        hideTooltip,
    } = props;

    const [
        hoveredRegionProperties,
        setHoveredRegionProperties,
    ] = React.useState<HoveredRegion>(undefinedHoveredRegion);

    const handleMapRegionMouseEnter = React.useCallback((feature, lngLat) => {
        setHoveredRegionProperties({
            feature,
            lngLat,
        });
    }, [setHoveredRegionProperties]);

    const handleMapRegionMouseLeave = React.useCallback(() => {
        setHoveredRegionProperties(undefinedHoveredRegion);
    }, [setHoveredRegionProperties]);

    return (
        <Map
            mapStyle="mapbox://styles/mapbox/light-v10"
            mapOptions={mapOptions}
            scaleControlShown
            scaleControlPosition="bottom-right"
            navControlShown
            navControlPosition="bottom-right"
        >
            <MapContainer className={_cs(styles.mapContainer, className)} />
            <MapSource
                sourceKey="nepal"
                sourceOptions={{
                    type: 'vector',
                    url: 'mapbox://adityakhatri.4p8awf71',
                }}
            >
                {regionLevel === 'municipality' && (
                    <MunicipalityLayer
                        onMouseEnter={handleMapRegionMouseEnter}
                        onMouseLeave={handleMapRegionMouseLeave}
                        mapState={mapState}
                        mapPaint={mapPaint}
                    />
                )}
                {regionLevel === 'district' && (
                    <DistrictLayer
                        onMouseEnter={handleMapRegionMouseEnter}
                        onMouseLeave={handleMapRegionMouseLeave}
                        mapState={mapState}
                        mapPaint={mapPaint}
                    />
                )}
                {regionLevel === 'province' && (
                    <ProvinceLayer
                        onMouseEnter={handleMapRegionMouseEnter}
                        onMouseLeave={handleMapRegionMouseLeave}
                        mapState={mapState}
                        mapPaint={mapPaint}
                    />
                )}
                {!hideTooltip && hoveredRegionProperties.lngLat && (
                    <MapTooltip
                        coordinates={hoveredRegionProperties.lngLat}
                        tooltipOptions={tooltipOptions}
                        trackPointer
                    >
                        <Tooltip
                            feature={hoveredRegionProperties.feature}
                        />
                    </MapTooltip>
                )}
            </MapSource>
            { children }
        </Map>
    );
}

export default IndicatorMap;
