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

function getSegments(
    totalSegments: number,
    minValue: number,
    maxValue: number,
    integer = false,
    includeMinimum = false,
) {
    const colorMap: { value: number; relativeLocation: number }[] = [];

    const range = maxValue - minValue;

    let gap = range / totalSegments;

    if (integer) {
        // gap should be at least one and integer
        gap = Math.max(Math.ceil(gap), 1);
    }

    const skipValue = includeMinimum ? 0 : 1;

    const realLength = Math.ceil(range / gap);
    // NOTE: we are excluding the minimum value
    for (let i = skipValue; i <= realLength; i += 1) {
        const value = minValue + (i * gap);

        const precision = getPrecision(value);
        const sanitizedValue = +(value.toFixed(precision));

        if (colorMap.length > 0 && colorMap[colorMap.length - 1].value === sanitizedValue) {
            // NOTE: avoid duplicate values
            // eslint-disable-next-line no-continue
            continue;
        }

        colorMap.push({
            relativeLocation: (i - skipValue) / (realLength - skipValue),
            value: sanitizedValue,
        });
    }

    return colorMap;
}

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

    let colorMap: {
        color: string;
        value: number;
    }[] = [];

    if (minValue !== Infinity && maxValue !== -Infinity && minValue !== maxValue) {
        const totalSegments = colorDomain.length;
        const segments = getSegments(
            totalSegments,
            minValue,
            maxValue,
            integer,
        );

        colorMap = segments.map(segment => ({
            value: segment.value,
            // NOTE: add a check here
            color: colorDomain[Math.round((totalSegments - 1) * segment.relativeLocation)],
        }));
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
    minVal: number,
    maxValue: number,
    maxRadius: number,
    integer = false,
    positiveColor = '#01665e',
    negativeColor = '#de2d26',
): {
    mapPaint: mapboxgl.CirclePaint;
    legend: { value: number; radius: number }[];
} => {
    const minValue = minVal === maxValue
        ? 0
        : minVal;

    if (minValue !== Infinity && maxValue !== -Infinity && minValue !== maxValue) {
        const array = [
            0, 0, // NOTE: previously it was minValue, 0,
            maxValue, maxRadius,
        ];

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

        const segments = getSegments(
            4,
            minValue,
            maxValue,
            integer,
            minValue !== 0,
        );

        const legend = segments.map(item => ({
            value: item.value,
            radius: maxRadius * (item.value / maxValue),
        }));

        return {
            mapPaint,
            legend,
        };
    }

    return {
        mapPaint: {
            'circle-radius': 0,
        },
        legend: [],
    };
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

export function getRasterLegendUrl(baseUrl: string, workspace: string, layer: string) {
    const legendUrl = [
        baseUrl, // 'http://34.71.203.97:8080/geoserver/Naxa/wms'
        '?',
        '&version=1.0.0',
        '&service=WMS',
        '&request=GetLegendGraphic',
        `&layer=${workspace}:${layer}`,
        '&format=image/png',
        '&width=20',
        '&height=20',
    ].join('');

    return legendUrl;
}

export const imageUrlToDataUrl = (url, callback) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        const reader = new FileReader();
        reader.onloadend = () => {
            callback(reader.result);
        };

        reader.readAsDataURL(xhr.response);
    };

    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
};
