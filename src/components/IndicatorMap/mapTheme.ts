const darkGray = '#6b6b6b';
const whiteHalo = 'rgba(255, 255, 255, 1)';

const provinceLabelPaint: mapboxgl.SymbolPaint = {
    'text-color': darkGray,
    'text-halo-color': whiteHalo,
    'text-halo-width': 1,
    'text-halo-blur': 0,
};
const districtLabelPaint: mapboxgl.SymbolPaint = {
    'text-color': darkGray,
    'text-halo-color': whiteHalo,
    'text-halo-width': 2,
};
const municipalityLabelPaint: mapboxgl.SymbolPaint = {
    'text-color': darkGray,
    'text-halo-color': whiteHalo,
    'text-halo-width': 2,
};

const provinceLabelLayout: mapboxgl.SymbolLayout = {
    visibility: 'visible',
    'text-allow-overlap': false,
    'text-font': ['Source Sans Pro SemiBold', 'Arial Unicode MS Regular'],
    'text-field': ['get', 'name'],
    'text-size': 14,
    'text-justify': 'center',
    'text-anchor': 'center',
    'text-padding': 0,
};

const districtLabelLayout: mapboxgl.SymbolLayout = {
    visibility: 'visible',
    'text-allow-overlap': false,
    'text-font': ['Source Sans Pro SemiBold', 'Arial Unicode MS Regular'],
    'text-field': ['get', 'name'],
    'text-size': 13,
    'text-justify': 'center',
    'text-anchor': 'center',
    'text-padding': 0,
};

const municipalityLabelLayout: mapboxgl.SymbolLayout = {
    visibility: 'visible',
    'text-allow-overlap': false,
    'text-font': ['Source Sans Pro SemiBold', 'Arial Unicode MS Regular'],
    'text-field': ['get', 'name'],
    'text-size': 12,
    'text-justify': 'center',
    'text-anchor': 'center',
    'text-padding': 0,
};

const provinceOutlinePaint: mapboxgl.LinePaint = {
    'line-color': '#000000',
    'line-width': 1,
    'line-opacity': [
        'case',
        ['==', ['feature-state', 'hovered'], true],
        1,
        0.3,
    ],
};

const districtOutlinePaint: mapboxgl.LinePaint = {
    'line-color': '#000000',
    'line-width': 1,
    'line-opacity': [
        'case',
        ['==', ['feature-state', 'hovered'], true],
        0.8,
        0.2,
    ],
};

const municipalityOutlinePaint: mapboxgl.LinePaint = {
    'line-color': '#000000',
    'line-width': 1,
    'line-opacity': [
        'case',
        ['==', ['feature-state', 'hovered'], true],
        0.8,
        0.1,
    ],
};

const theme = {
    province: {
        outlinePaint: provinceOutlinePaint,
        labelPaint: provinceLabelPaint,
        labelLayout: provinceLabelLayout,
    },
    district: {
        outlinePaint: districtOutlinePaint,
        labelPaint: districtLabelPaint,
        labelLayout: districtLabelLayout,
    },
    municipality: {
        outlinePaint: municipalityOutlinePaint,
        labelPaint: municipalityLabelPaint,
        labelLayout: municipalityLabelLayout,
    },
};

export const noneLayout: mapboxgl.Layout = {
    visibility: 'none',
};

export const visibleLayout: mapboxgl.Layout = {
    visibility: 'visible',
};

export default theme;
