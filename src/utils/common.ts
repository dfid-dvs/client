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
    const range = maxValue - minValue;
    const colors: (string | number)[] = [];
    const legend: {
        [key: string]: number;
    } = {};


    if (!Number.isNaN(range) && range !== Infinity && range !== -Infinity) {
        const gap = range / colorDomain.length;

        if (maxValue <= 1 || gap < 1) {
            colorDomain.forEach((color, i) => {
                const val = +(minValue + (i + 1) * gap).toFixed(1);
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

    let paint: {
        'fill-color': string | any[];
        'fill-opacity': number | any[];
    } = {
        'fill-color': '#08467d',
        'fill-opacity': 0.1,
    };

    if (colors.length !== 0) {
        const fillColor = [
            'step',
            ['feature-state', 'value'],
            ...colors.slice(0, -1),
        ];

        const fillOpacity = [
            'case',
            ['==', ['feature-state', 'value'], null],
            0.1,
            ['==', ['feature-state', 'hovered'], true],
            0.97,
            0.77,
        ];

        paint = {
            'fill-color': fillColor,
            'fill-opacity': fillOpacity,
        };
    }

    return { paint, legend };
};
