import React, { useState, useEffect } from 'react';
import { _cs } from '@togglecorp/fujs';

import { Layer } from '#types';
import {
    imageUrlToDataUrl,
    getRasterLegendUrl,
} from '#utils/common';

import styles from './styles.css';

interface RasterLegendProps {
    className?: string;
    rasterLayer?: Layer;
}

function Legend(props: RasterLegendProps) {
    const {
        className,
        rasterLayer,
    } = props;

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
                        setRasterLegendDataUrl(dataUrl);
                    },
                );
            }
        },
        [rasterLayer],
    );

    if (!rasterLegendDataUrl) {
        return null;
    }

    return (
        <div className={_cs(styles.rasterLegend, className)}>
            {rasterLayer?.name && (
                <h5 className={styles.heading}>
                    {rasterLayer?.name}
                </h5>
            )}
            <img
                className={styles.rasterLegendImage}
                src={rasterLegendDataUrl}
                alt={rasterLayer?.layerName}
            />
        </div>
    );
}

export default Legend;
