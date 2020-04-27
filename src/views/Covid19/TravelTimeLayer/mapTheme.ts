export const fourHourColor = 'green';
export const fourHourDarkColor = '#387002';

export const eightHourColor = 'yellow';
export const eightHourDarkColor = '#c67100';

export const twelveHourColor = 'red';
export const twelveHourDarkColor = '#9a0007';

const catchmentTwelveHourFillPaint: mapboxgl.FillPaint = {
    'fill-color': twelveHourColor,
    'fill-opacity': 0.4,
};
const catchmentEightHourFillPaint: mapboxgl.FillPaint = {
    'fill-color': eightHourColor,
    'fill-opacity': 0.4,
};
const catchmentFourHourFillPaint: mapboxgl.FillPaint = {
    'fill-color': fourHourColor,
    'fill-opacity': 0.4,
};
const catchmentTwelveHourLinePaint: mapboxgl.LinePaint = {
    'line-width': 2,
    'line-color': twelveHourDarkColor,
    'line-opacity': [
        'case',
        ['==', ['feature-state', 'hovered'], true],
        1,
        0,
    ],
};
const catchmentEightHourLinePaint: mapboxgl.LinePaint = {
    'line-width': 2,
    'line-color': eightHourDarkColor,
    'line-opacity': [
        'case',
        ['==', ['feature-state', 'hovered'], true],
        1,
        0,
    ],
};
const catchmentFourHourLinePaint: mapboxgl.LinePaint = {
    'line-width': 2,
    'line-color': fourHourDarkColor,
    'line-opacity': [
        'case',
        ['==', ['feature-state', 'hovered'], true],
        1,
        0,
    ],
};

const hospitalCirclePaint = (selectedHospitals: string[]): mapboxgl.CirclePaint => ({
    'circle-radius': 9,
    'circle-color': '#fff',
    'circle-stroke-color': '#a72828',
    'circle-stroke-width': [
        'case',
        ['in', ['get', 'name'], ['literal', selectedHospitals]],
        2,
        0,
    ],
    'circle-opacity': [
        'case',
        ['in', ['get', 'name'], ['literal', selectedHospitals]],
        0.9,
        0.7,
    ],
});


const hospitalSymbolPaint: mapboxgl.SymbolPaint = {
    'icon-color': '#a72828',
};

const hospitalSymbolLayout: mapboxgl.SymbolLayout = {
    'icon-image': 'hospital-11',
    'icon-allow-overlap': true,
};

const theme = {
    catchment: {
        twelvehour: {
            fillPaint: catchmentTwelveHourFillPaint,
            linePaint: catchmentTwelveHourLinePaint,
        },
        eighthour: {
            fillPaint: catchmentEightHourFillPaint,
            linePaint: catchmentEightHourLinePaint,
        },
        fourhour: {
            fillPaint: catchmentFourHourFillPaint,
            linePaint: catchmentFourHourLinePaint,
        },
    },
    uncovered: {
    },
    hospital: {
        circlePaint: hospitalCirclePaint,

        symbolPaint: hospitalSymbolPaint,
        symbolLayout: hospitalSymbolLayout,
    },
};

export const visibleLayout: mapboxgl.LineLayout = {
    visibility: 'visible',
};
export const noneLayout: mapboxgl.LineLayout = {
    visibility: 'none',
};

export default theme;
