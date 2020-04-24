export const defaultCenter: mapboxgl.LngLatLike = [
    84.1240, 28.3949,
];

export const defaultBounds: [number, number, number, number] = [
    80.05858661752784, 26.347836996368667,
    88.20166918432409, 30.44702867091792,
];

export const mapOptions: Omit<mapboxgl.MapboxOptions, 'style' | 'container'> = {
    logoPosition: 'bottom-right',
    minZoom: 5,
    zoom: 3,
    center: defaultCenter,
    bounds: defaultBounds,
};

export const tooltipOptions: mapboxgl.PopupOptions = {
    closeOnClick: false,
    closeButton: false,
    offset: 8,
    maxWidth: '480px',
};

export const colorDomain: string[] = [
    '#a8c1e7',
    '#8ba8d1',
    '#6e90bb',
    '#5078a6',
    '#316291',
    '#004c7d',
];

export const apiEndPoint = 'https://dvsnaxa.naxa.com.np/api/v1/core';
