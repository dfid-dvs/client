import {
    isDefined,
    isObject,
    isList,
} from '@togglecorp/fujs';

export const forEach = (obj: object, func: (key: string, val: unknown) => void) => {
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
    minValue: number,
    maxValue: number,
) => {
    const colors: (string | number)[] = [];

    const legend: {
        [key: string]: number;
    } = {};

    const range = maxValue - minValue;

    if (!Number.isNaN(range) && range !== Infinity && range !== -Infinity) {
        const gap = range / colorDomain.length;

        if (maxValue <= 1 || gap < 1) {
            colorDomain.forEach((color, i) => {
                const val = +(minValue + (i + 1) * gap).toFixed(4);
                // NOTE: avoid duplicates
                if (colors.length > 0 && colors[colors.length - 1] === val) {
                    return;
                }
                colors.push(color);
                colors.push(val);
                legend[color] = val;
            });
        } else {
            colorDomain.forEach((color, i) => {
                const val = Math.floor(minValue + (i + 1) * gap);
                // NOTE: avoid duplicates
                if (colors.length > 0 && colors[colors.length - 1] === val) {
                    return;
                }
                colors.push(color);
                colors.push(val);
                legend[color] = val;
            });
        }
    }

    if (colors.length >= 4) {
        const colorsWithoutLastValue = colors.slice(0, -1);

        const fillColor: mapboxgl.FillPaint['fill-color'] = [
            'step',
            ['feature-state', 'value'],
            ...colorsWithoutLastValue,
        ];

        const fillOpacity: mapboxgl.FillPaint['fill-opacity'] = [
            'case',
            // ['==', ['feature-state', 'hovered'], true],
            // 1,
            ['==', ['feature-state', 'value'], null],
            0.1,
            0.90,
        ];

        const paint = {
            'fill-color': fillColor,
            'fill-opacity': fillOpacity,
        };
        return { min: minValue, paint, legend };
    }

    const emptyPaint: mapboxgl.FillPaint = {
        'fill-color': '#08467d',
        'fill-opacity': 0.1,
    };
    const emptyLegend: typeof legend = {};

    return { min: minValue, paint: emptyPaint, legend: emptyLegend };
};

export const generateBubbleMapPaintAndLegend = (
    minValue: number = 0,
    maxValue: number = 1,
    maxRadius: number = 50,
) => {
    const quarterPoint = minValue + ((minValue + maxValue) / 8);
    const array = [
        minValue, 0,
        quarterPoint, maxRadius / 5,
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
            '#01665e',
            '#de2d26',
        ],
        'circle-opacity': 0.6,
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 1,
        'circle-stroke-opacity': 0.2,
    });

    const mapLegend = [
        {
            label: `0 - ${Math.round(quarterPoint * 100) / 100}`,
            radius: Math.round((maxRadius / 5 * 100) / 100),
        },
        {
            label: `${Math.round(quarterPoint * 100) / 100} - ${Math.round(maxValue * 100) / 100}`,
            radius: maxRadius,
        },
    ];

    return ({
        mapPaint,
        mapLegend,
    });
};
