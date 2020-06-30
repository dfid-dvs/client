import React, { memo } from 'react';

import {
    isDefined,
    isObject,
    isNotDefined,
    isList,
    listToMap,
    isFalsyString,
} from '@togglecorp/fujs';

import {
    LegendItem,
    MapStateItem,
    RegionLevelOption,
} from '#types';

import { getPrecision } from '#components/Numeral';

export interface UrlParams {
    [key: string]: string | number | boolean | (string | number | boolean)[] | undefined | null;
}

/*
 * Parse url params and return an key-value pair
 * Input: stringParams (this.props.location.search.replace('?', ''))
 * Output: {'param': 'value', ....}
 */
export function parseUrlParams(stringParams: string) {
    const params = decodeURIComponent(stringParams).split('&');
    let paramsJson = {};
    params.forEach((param) => {
        const split = param.split('=');
        paramsJson = {
            ...paramsJson,
            [split[0]]: split[1],
        };
    });
    return paramsJson;
}

/*
 * Accept a key-value pair and transform to query string
 */
export function prepareUrlParams(params: UrlParams, encode = true) {
    return Object.keys(params)
        .filter(k => isDefined(params[k]))
        .map((k) => {
            const param = params[k];
            if (isNotDefined(param)) {
                return undefined;
            }
            let val: string;
            if (Array.isArray(param)) {
                val = param.join(',');
            } else if (typeof param === 'number' || typeof param === 'boolean') {
                val = String(param);
            } else {
                val = param;
            }
            if (isFalsyString(val)) {
                return undefined;
            }
            if (encode) {
                return `${encodeURIComponent(k)}=${encodeURIComponent(val)}`;
            }
            return `${k}=${val}`;
        })
        .filter(isDefined)
        .join('&');
}

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

export function getFloatPlacement(parentRef: React.RefObject<HTMLElement>) {
    const placement = {
        top: 'unset',
        right: 'unset',
        bottom: 'unset',
        left: 'unset',
        minWidth: 'unset',
        width: 'unset',
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

        placement.width = `${width}px`;
        placement.minWidth = '240px';
    }

    return placement;
}

export function filterMapState(
    value: MapStateItem[],
    regionLevel: RegionLevelOption,
    excludeValley: boolean,
) {
    const excludeKathmanduValleyFilter = (item: MapStateItem) => {
        if (regionLevel === 'district') {
            return ![25, 26, 27].includes(item.id);
        }
        if (regionLevel === 'municipality') {
            return ![
                280, 281, 282, 283, 284, 285, // lalitpur
                286, 287, 288, 289, // bhaktapur
                290, 291, 292, 293, 294, 295, 296, 297, 299, 300, // kathmandu
            ].includes(item.id);
        }
        return true;
    };

    const valueList = value
        .map(d => d.value)
        .filter(isDefined);

    const min = Math.min(...valueList);
    const max = Math.max(...valueList);

    if (excludeValley) {
        const excludedValueList = value
            .filter(excludeKathmanduValleyFilter)
            .map(d => d.value)
            .filter(isDefined);
        const newMin = Math.min(...excludedValueList);
        const newMax = Math.max(...excludedValueList);
        return {
            list: excludedValueList,
            min: newMin,
            max: newMax,
            maxExceeds: newMax < max,
            minExceeds: newMin > min,
        };
    }

    return { list: valueList, min, max };
}


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
    const fillOpacityForNoData = 0.4;
    const fillColorForNoData = '#78909c';

    let minValue = minVal;
    if (minVal === maxValue) {
        minValue = 0;
    } else if (maxValue - minVal <= 1 && integer) {
        minValue = minVal - 1;
    }

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
                'fill-color': fillColorForNoData,
                'fill-opacity': fillOpacityForNoData,
            },
            legend: {},
        };
    }

    const colors = colorMap
        .map(item => [item.color, item.value])
        .flat();

    const fillColor: mapboxgl.FillPaint['fill-color'] = [
        'case',
        ['==', ['feature-state', 'value'], null],
        fillColorForNoData,
        [
            'step',
            ['feature-state', 'value'],
            ...colors,
            colorDomain[colorDomain.length - 1], // this will never be used
        ],
    ];

    const fillOpacity: mapboxgl.FillPaint['fill-opacity'] = [
        'case',
        ['==', ['feature-state', 'value'], null],
        fillOpacityForNoData,
        0.8,
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
    legend: LegendItem[];
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
            // minValue !== 0,
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


export function getVectorTile(baseUrl: string, workspace: string, layer: string) {
    const params = prepareUrlParams({
        service: 'WMTS',
        version: '1.0.0',
        request: 'GetTile',
        layer: `${workspace}:${layer}`,
        tilematrix: 'EPSG:900913:{z}',
        tilematrixset: 'EPSG:900913',

        format: 'application/vnd.mapbox-vector-tile',
        tilecol: '{x}',
        tilerow: '{y}',
    }, false);
    return `${baseUrl}?${params}`;
}

export function getRasterTile(baseUrl: string, workspace: string, layer: string) {
    const params = prepareUrlParams({
        service: 'WMS',
        version: '1.1.1',
        request: 'GetMap',
        format: 'image/png',
        transparent: true,
        layers: `${workspace}:${layer}`,
        exceptions: 'application/vnd.ogc.se_inimage',
        width: 256,
        height: 256,
        srs: 'EPSG:3857',
        bbox: '{bbox-epsg-3857}',
    }, false);
    return `${baseUrl}?${params}`;
}

export function getRasterLegendUrl(baseUrl: string, workspace: string, layer: string) {
    const params = prepareUrlParams({
        service: 'WMS',
        version: '1.0.0',
        request: 'GetLegendGraphic',
        layer: `${workspace}:${layer}`,
        format: 'image/png',
        width: 20,
        height: 20,
    }, false);
    return `${baseUrl}?${params}`;
}

export const imageUrlToDataUrl = (
    url: string,
    callback: (result: string | null) => void,
) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string' || !reader.result) {
                callback(reader.result);
            }
        };

        reader.readAsDataURL(xhr.response);
    };

    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
};

// Refer https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-542793243
export const typedMemo: (<T>(c: T) => T) = memo;

export type ExtractKeys<T, M> = {
    [K in keyof Required<T>]: Required<T>[K] extends M ? K : never
}[keyof T];
