export const defaultCenter: [number, number] = [
    84.1240, 28.3949,
];

export const defaultBounds: [number, number, number, number] = [
    80.05858661752784, 26.347836996368667,
    88.20166918432409, 30.44702867091792,
];

export const mapOptions = {
    logoPosition: 'top-left',
    minZoom: 5,
    zoom: 3,
    center: defaultCenter,
    bounds: defaultBounds,
};

export const tooltipOptions = {
    closeOnClick: false,
    closeButton: false,
    offset: 8,
    maxWidth: '480px',
};

export const colorDomain = [
    '#004c7d',
    '#316291',
    '#5078a6',
    '#6e90bb',
    '#8ba8d1',
    '#a8c1e7',
];
