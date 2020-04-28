export const fourHourColor = 'green';
export const fourHourDarkColor = 'darkgreen';

export const eightHourColor = 'gold';
export const eightHourDarkColor = 'darkorange';

export const twelveHourColor = 'red';
export const twelveHourDarkColor = 'darkred';

export const fourHourUncoveredColor = 'green';
export const fourHourUncoveredDarkColor = 'darkgreen';

export const eightHourUncoveredColor = 'gold';
export const eightHourUncoveredDarkColor = 'darkorange';

export const twelveHourUncoveredColor = 'red';
export const twelveHourUncoveredDarkColor = 'darkred';

const uncoveredTwelveHourFillPaint: mapboxgl.FillPaint = {
    'fill-color': twelveHourUncoveredColor,
    'fill-opacity': 0.3,
};
const uncoveredEightHourFillPaint: mapboxgl.FillPaint = {
    'fill-color': eightHourUncoveredColor,
    'fill-opacity': 0.3,
};
const uncoveredFourHourFillPaint: mapboxgl.FillPaint = {
    'fill-color': fourHourUncoveredColor,
    'fill-opacity': 0.3,
};
const uncoveredTwelveHourLinePaint: mapboxgl.LinePaint = {
    'line-width': 2,
    'line-color': twelveHourUncoveredDarkColor,
    'line-opacity': [
        'case',
        ['==', ['feature-state', 'hovered'], true],
        1,
        0,
    ],
};
const uncoveredEightHourLinePaint: mapboxgl.LinePaint = {
    'line-width': 2,
    'line-color': eightHourUncoveredDarkColor,
    'line-opacity': [
        'case',
        ['==', ['feature-state', 'hovered'], true],
        1,
        0,
    ],
};
const uncoveredFourHourLinePaint: mapboxgl.LinePaint = {
    'line-width': 2,
    'line-color': fourHourUncoveredDarkColor,
    'line-opacity': [
        'case',
        ['==', ['feature-state', 'hovered'], true],
        1,
        0,
    ],
};

const catchmentTwelveHourFillPaint: mapboxgl.FillPaint = {
    'fill-color': twelveHourColor,
    'fill-opacity': 0.3,
};
const catchmentEightHourFillPaint: mapboxgl.FillPaint = {
    'fill-color': eightHourColor,
    'fill-opacity': 0.3,
};
const catchmentFourHourFillPaint: mapboxgl.FillPaint = {
    'fill-color': fourHourColor,
    'fill-opacity': 0.3,
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
    'icon-image': 'hospital-15',
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
        twelvehour: {
            fillPaint: uncoveredTwelveHourFillPaint,
            linePaint: uncoveredTwelveHourLinePaint,
        },
        eighthour: {
            fillPaint: uncoveredEightHourFillPaint,
            linePaint: uncoveredEightHourLinePaint,
        },
        fourhour: {
            fillPaint: uncoveredFourHourFillPaint,
            linePaint: uncoveredFourHourLinePaint,
        },
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
