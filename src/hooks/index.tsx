import React from 'react';

import {
    Response,
    RegionLevelOption,
    AgeGroupOption,
    MapState,
} from '#types';

import { apiEndPoint } from '#utils/constants';

export function useForm<T>(
    values: T,
    setValues: (value: T) => void,
    // errors: {} = {},
) {
    const handleChange = (e: InputChangeEvent) => {
        const {
            value,
            name,
        } = e;

        if (name) {
            setValues({
                ...values,
                [name]: value,
            });
        }
    };

    const formElement = (name: string) => ({
        name,
        onChange: handleChange,
        value: values[name],
        // error: fieldErrors[name],
    });

    // const nonFieldErrors = [];

    return {
        formElement,
        values,
        // fieldErrors,
        // nonFieldErrors,
    };
}

const defaultResponse = {
    count: 0,
    results: [],
    data: [],
};

const requestOption = {
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
    },
};


export function useRequest<T>(
    url?: string,
    options: {} = requestOption,
    deps: React.DependencyList = [],
): [boolean, Response<T>] {
    const [response, setResponse] = React.useState<Response<T>>(defaultResponse);
    const [pending, setPending] = React.useState(!!url);

    React.useEffect(() => {
        if (url) {
            setPending(true);
            try {
                fetch(url, options).then((responseFromRequest) => {
                    if (Math.floor(responseFromRequest.status / 100) === 2) {
                        try {
                            responseFromRequest.json().then((data) => {
                                if (Array.isArray(data)) {
                                    setResponse({
                                        count: 1,
                                        results: data,
                                        data,
                                    });
                                } else {
                                    setResponse(data);
                                }
                                setPending(false);
                            });
                        } catch (e) {
                            setPending(false);
                            console.error(e);
                        }
                    } else {
                        setPending(false);
                        console.error(`An error occured while fetching ${url}`);
                        window.alert('Cannot fetch data');
                    }
                }, (e) => {
                    setPending(false);
                    console.error(`An error occured while fetching ${url}`, e);
                    window.alert('Cannot fetch data');
                });
            } catch (e) {
                setPending(false);
                console.error(`An error occured while fetching ${url}`, e);
                window.alert('Cannot fetch data');
            }
        }
    }, [url, options, ...deps]);

    return [pending, response];
}

export function useBlurEffect(
    shouldWatch: boolean,
    callback: (clickedInside: boolean, e: MouseEvent) => void,
    elementRef: React.RefObject<HTMLElement>,
    parentRef: React.RefObject<HTMLElement>,
    deps?: React.DependencyList,
) {
    React.useEffect(() => {
        const handleDocumentClick = (e: MouseEvent) => {
            const { current: element } = elementRef;
            const { current: parent } = parentRef;

            const isElementOrContainedInElement = element
                ? element === e.target || element.contains(e.target as HTMLElement)
                : false;
            const isParentOrContainedInParent = parent
                ? parent === e.target || parent.contains(e.target as HTMLElement)
                : false;

            const clickedInside = isElementOrContainedInElement || isParentOrContainedInParent;
            callback(clickedInside, e);
        };

        if (shouldWatch) {
            document.addEventListener('click', handleDocumentClick);
        } else {
            document.removeEventListener('click', handleDocumentClick);
        }

        return () => { document.removeEventListener('click', handleDocumentClick); };
    }, deps);
}

interface IndicatorValue {
    code: number;
    value: number;
}

export function useMapStateForIndicator(
    regionLevel: RegionLevelOption,
    selectedIndicator: number | undefined,
): [boolean, MapState[]] {
    const showProvince = regionLevel === 'province';
    const showDistrict = regionLevel === 'district';
    const showMunicipality = regionLevel === 'municipality';

    const provinceIndicatorListGetUrl = showProvince && selectedIndicator
        ? `${apiEndPoint}/province-indicator/${selectedIndicator}`
        : undefined;

    const districtIndicatorListGetUrl = showDistrict && selectedIndicator
        ? `${apiEndPoint}/district-indicator/${selectedIndicator}`
        : undefined;

    const municipalityIndicatorListGetUrl = showMunicipality && selectedIndicator
        ? `${apiEndPoint}/municipality-indicator/?indicator_id=${selectedIndicator}`
        : undefined;

    const [
        provinceIndicatorListPending,
        provinceIndicatorListResponse,
    ] = useRequest<IndicatorValue>(provinceIndicatorListGetUrl);

    const [
        districtIndicatorListPending,
        districtIndicatorListResponse,
    ] = useRequest<IndicatorValue>(districtIndicatorListGetUrl);

    const [
        municipalityIndicatorListPending,
        municipalityIndicatorListResponse,
    ] = useRequest<IndicatorValue>(municipalityIndicatorListGetUrl);

    const provinceMapState = React.useMemo(
        () => {
            let state: MapState[] = [];
            if (provinceIndicatorListPending) {
                return state;
            }
            state = provinceIndicatorListResponse.results.map(d => ({
                id: d.code,
                value: d.value,
            }));
            return state;
        },
        [provinceIndicatorListPending, provinceIndicatorListResponse],
    );

    const districtMapState = React.useMemo(
        () => {
            let state: MapState[] = [];
            if (districtIndicatorListPending) {
                return state;
            }
            state = districtIndicatorListResponse.results.map(d => ({
                id: d.code,
                value: d.value,
            }));
            return state;
        },
        [districtIndicatorListPending, districtIndicatorListResponse],
    );

    const municipalityMapState = React.useMemo(
        () => {
            let state: MapState[] = [];
            if (municipalityIndicatorListPending) {
                return state;
            }
            state = municipalityIndicatorListResponse.results.map(d => ({
                id: d.code,
                value: d.value,
            }));
            return state;
        },
        [municipalityIndicatorListPending, municipalityIndicatorListResponse],
    );

    let mapState: MapState[] = [];

    switch (regionLevel) {
        case 'municipality':
            mapState = municipalityMapState;
            break;
        case 'district':
            mapState = districtMapState;
            break;
        case 'province':
            mapState = provinceMapState;
            break;
        default:
            break;
    }

    const pending = municipalityIndicatorListPending
        || districtIndicatorListPending
        || provinceIndicatorListPending;


    return [pending, mapState];
}

export function useMapStateForAgeGroup(
    shouldUse: boolean,
    ageGroup: AgeGroupOption,
    regionLevel: RegionLevelOption,
): [boolean, MapState[]] {
    const ageGroupListUrl = shouldUse ? 'https://covidapi.naxa.com.np/api/v1/age-data/' : undefined;
    const [
        ageGroupListPending,
        ageGroupListResponse,
    ] = useRequest(ageGroupListUrl);

    const mapState = React.useMemo(
        () => {
            let state: MapState[] = [];

            if (ageGroupListPending) {
                return state;
            }

            const regionIdByRegionLevel = {
                province: 'provinceId',
                district: 'districtId',
                municipality: 'munid',
            };

            const valueByAgeGroup = {
                belowFourteen: 'l0_14',
                fifteenToFourtyNine: 'l15_49',
                aboveFifty: 'l50plus',
            };

            state = ageGroupListResponse.results.map(d => ({
                id: d[regionIdByRegionLevel[regionLevel]],
                value: d[valueByAgeGroup[ageGroup]],
            }));

            return state;
        },
        [ageGroupListPending, ageGroupListResponse, ageGroup, regionLevel],
    );

    return [ageGroupListPending, mapState];
}
