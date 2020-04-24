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

interface HoveredRegion {
    feature: mapboxgl.MapboxGeoJSONFeature;
    lngLat: mapboxgl.LngLatLike;
}

const Tooltip = ({
    feature,
}: { feature: mapboxgl.MapboxGeoJSONFeature }) => {
    if (!feature) {
        return null;
    }

    return (
        <div className={styles.tooltip}>
            {feature.properties && (
                <div className={styles.regionTitle}>
                    { feature.properties.name }
                </div>
            )}
            {feature.state && (
                <div className={styles.value}>
                    { feature.state.value }
                </div>
            )}
        </div>
    );
};

interface Props {
    className?: string;
    regionLevel: 'municipality' | 'district' | 'province';
    // FIXME: use type from typings
    mapState: { id: number; value: number }[];
    mapPaint: mapboxgl.FillPaint;
    children?: React.ReactNode;
    hideTooltip?: boolean;
}

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
    ] = React.useState<HoveredRegion | undefined>();

    const handleMapRegionMouseEnter = React.useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            setHoveredRegionProperties({
                feature,
                lngLat,
            });
        },
        [setHoveredRegionProperties],
    );

    const handleMapRegionMouseLeave = React.useCallback(() => {
        setHoveredRegionProperties(undefined);
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
                    url: 'mapbox://togglecorp.8cq1z31t',
                }}
            >
                <MunicipalityLayer
                    visible={regionLevel === 'municipality'}
                    onMouseEnter={handleMapRegionMouseEnter}
                    onMouseLeave={handleMapRegionMouseLeave}
                    mapState={mapState}
                    mapPaint={mapPaint}
                />
                <DistrictLayer
                    visible={regionLevel === 'district'}
                    onMouseEnter={handleMapRegionMouseEnter}
                    onMouseLeave={handleMapRegionMouseLeave}
                    mapState={mapState}
                    mapPaint={mapPaint}
                />
                <ProvinceLayer
                    visible={regionLevel === 'province'}
                    onMouseEnter={handleMapRegionMouseEnter}
                    onMouseLeave={handleMapRegionMouseLeave}
                    mapState={mapState}
                    mapPaint={mapPaint}
                />
                {!hideTooltip && hoveredRegionProperties && hoveredRegionProperties.lngLat && (
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
