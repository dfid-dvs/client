import {
    isDefined,
    isObject,
    isList,
    listToMap,
} from '@togglecorp/fujs';

import { getPrecision } from '#components/Numeral';

const forEach = (obj: object, func: (key: string, val: unknown) => void) => {
    Object.keys(obj).forEach((key) => {
        const val = (obj as any)[key];
        func(key, val);
    });
};

export const sanitizeResponse = (data: unknown): any => {
    if (data === null || data === undefined) {
        return undefined;
    }
    if (isList(data)) {
        return data.map(sanitizeResponse).filter(isDefined);
    }
    if (isObject(data)) {
        let newData = {};
        forEach(data, (k, val) => {
            const newEntry = sanitizeResponse(val);
            if (newEntry) {
                newData = {
                    ...newData,
                    [k]: newEntry,
                };
            }
        });
        return newData;
    }
    return data;
};

export const getFloatPlacement = (parentRef: React.RefObject<HTMLElement>) => {
    const placement = {
        top: 'unset',
        right: 'unset',
        bottom: 'unset',
        left: 'unset',
    };

    if (parentRef.current) {
        const parentBCR = parentRef.current.getBoundingClientRect();
        const { x, y, width, height } = parentBCR;

        const cX = window.innerWidth / 2;
        const cY = window.innerHeight / 2;

        const horizontalPosition = (cX - parentBCR.x) > 0 ? 'right' : 'left';
        const verticalPosition = (cY - parentBCR.y) > 0 ? 'bottom' : 'top';


        if (horizontalPosition === 'left') {
            placement.right = `${window.innerWidth - x - width}px`;
        } else if (horizontalPosition === 'right') {
            placement.left = `${x}px`;
        }

        if (verticalPosition === 'top') {
            placement.bottom = `${window.innerHeight - y}px`;
        } else if (verticalPosition === 'bottom') {
            placement.top = `${y + height}px`;
        }
    }

    return placement;
};


export const generateChoroplethMapPaintAndLegend = (
    colorDomain: string[],
    minVal: number,
    maxValue: number,
    integer = false,
): {
    min: number;
    paint: mapboxgl.FillPaint;
    legend: { [key: string]: number };
} => {
    // NOTE: handle diverging series
    // NOTE: handle overflow/underflow

    const minValue = minVal === maxValue
        ? 0
        : minVal;

    const colorMap: {
        color: string;
        value: number;
    }[] = [];

    if (minValue !== Infinity && maxValue !== -Infinity && minValue !== maxValue) {
        const totalSegments = colorDomain.length;
        const range = maxValue - minValue;

        let gap = range / (totalSegments + 1);

        if (integer) {
            // gap should be at least one and integer
            gap = Math.max(Math.ceil(gap), 1);
        }

        const realLength = Math.ceil(range / gap) + 1;
        // NOTE: we are excluding the minimum value
        for (let i = 1; i < realLength; i += 1) {
            const value = minValue + (i * gap);

            const precision = getPrecision(value);
            const sanitizedValue = +(value.toFixed(precision));

            if (colorMap.length > 0 && colorMap[colorMap.length - 1].value === sanitizedValue) {
                // NOTE: avoid duplicate values
                // eslint-disable-next-line no-continue
                continue;
            }

            const colorIndex = Math.round(totalSegments * ((i - 1) / (realLength - 1)));
            if (colorIndex >= totalSegments) {
                console.error('Range exceeded');
                // eslint-disable-next-line no-continue
                continue;
            }

            const color = colorDomain[colorIndex];
            colorMap.push({
                color,
                value: sanitizedValue,
            });
        }
    }

    // Need at least start and end
    if (colorMap.length < 2) {
        return {
            min: minValue,
            paint: {
                'fill-color': '#08467d',
                'fill-opacity': 0.1,
            },
            legend: {},
        };
    }

    const colors = colorMap
        .map(item => [item.color, item.value])
        .flat()
        .slice(0, -1); // remove last element

    const fillColor: mapboxgl.FillPaint['fill-color'] = [
        'step',
        ['feature-state', 'value'],
        ...colors,
    ];

    const fillOpacity: mapboxgl.FillPaint['fill-opacity'] = [
        'case',
        ['==', ['feature-state', 'value'], null],
        0.1,
        0.7,
    ];

    const paint: mapboxgl.FillPaint = {
        'fill-color': fillColor,
        'fill-opacity': fillOpacity,
    };

    return {
        min: minValue,
        paint,
        legend: listToMap(
            colorMap,
            item => item.color,
            item => item.value,
        ),
    };
};

export const generateBubbleMapPaintAndLegend = (
    minVal: number = 0,
    maxValue: number = 0,
    maxRadius: number = 50,
    positiveColor: string = '#01665e',
    negativeColor: string = '#de2d26',
) => {
    let minValue = minVal;
    if (minValue === maxValue) {
        minValue = 0;
    }

    let array = [
        minValue, 0,
        maxValue, maxRadius,
    ];

    if (minValue === maxValue && maxValue === 0) {
        array = [
            0, 0,
            1, maxRadius,
        ];
    }

    const mapPaint: mapboxgl.CirclePaint = ({
        'circle-radius': [
            'interpolate', ['linear'],
            ['abs', ['number', ['feature-state', 'value'], 0]],
            ...array,
        ],
        'circle-color': [
            'case',
            ['>', ['number', ['feature-state', 'value'], 0], 0],
            positiveColor,
            negativeColor,
        ],
        'circle-opacity': 0.6,
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 1,
        'circle-stroke-opacity': 0.2,
    });

    const legend = [];
    let currentRadius = 10;

    if (minValue !== maxValue) {
        while (currentRadius <= maxRadius) {
            const valueInCurrentRadius = minValue
                + ((maxValue - minValue) / maxRadius) * currentRadius;
            legend.push({
                value: valueInCurrentRadius,
                radius: currentRadius,
            });
            currentRadius += 10;
        }
    }

    return ({
        mapPaint,
        legend,
    });
};

export function getRasterTile(baseUrl: string, workspace: string, layer: string) {
    const rasterTile = [
        baseUrl, // 'http://34.71.203.97:8080/geoserver/Naxa/wms'
        '?',
        '&service=WMS',
        '&version=1.1.1',
        '&request=GetMap',
        '&format=image/png',
        '&transparent=true',
        '&tiled=true',
        `&layers=${workspace}:${layer}`,
        '&exceptions=application/vnd.ogc.se_inimage',
        '&width=256',
        '&height=256',
        '&srs=EPSG:3857',
        '&bbox={bbox-epsg-3857}',
    ].join('');
    return rasterTile;
}
