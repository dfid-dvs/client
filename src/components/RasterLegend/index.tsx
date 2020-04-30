import React, { useState, useEffect } from 'react';

import { Layer } from '#types';
import {
    imageUrlToDataUrl,
    getRasterLegendUrl,
} from '#utils/common';

import styles from './styles.css';

interface RasterLegendProps {
    rasterLayer?: Layer;
}

function Legend(props: RasterLegendProps) {
    const {
        rasterLayer,
    } = props;

    const [loadingLegend, setLoadingLegend] = useState(true);
    const [rasterLegendDataUrl, setRasterLegendDataUrl] = useState<string|undefined>();

    useEffect(
        () => {
            if (rasterLayer) {
                const url = getRasterLegendUrl(
                    rasterLayer.geoserverUrl,
                    rasterLayer.workspace,
                    rasterLayer.layerName,
                );
                imageUrlToDataUrl(
                    url,
                    (dataUrl: string) => {
                        setLoadingLegend(false);
                        setRasterLegendDataUrl(dataUrl);
                    },
                );
            }
        },
        [rasterLayer],
    );

    return (
        <div className={styles.rasterLegend}>
            { rasterLegendDataUrl && (
                <div className={styles.rasterLegend}>
                    <img
                        className={styles.rasterLegendImage}
                        src={rasterLegendDataUrl}
                        alt={rasterLayer?.layerName}
                    />
                </div>
            )}
        </div>
    );
}

export default Legend;
