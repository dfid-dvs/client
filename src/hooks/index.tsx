import React from 'react';

import {
    listToGroupList,
    isDefined,
} from '@togglecorp/fujs';
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

function useAgeGroupList(
    shouldUse: boolean,
    regionLevel: RegionLevelOption,
): [boolean, any[]] {
    const ageGroupListUrl = shouldUse ? 'https://covidapi.naxa.com.np/api/v1/age-data/' : undefined;
    const [
        ageGroupListPending,
        ageGroupListResponse,
    ] = useRequest(ageGroupListUrl);

    const sanitizedAgeGroupList = ageGroupListResponse.results.filter(
        d => d.munid !== 38,
    );

    const ageGroupListByProvince = React.useMemo(() => {
        const provinceGroupedList = listToGroupList(
            sanitizedAgeGroupList,
            d => d.provinceId,
        );

        const ageGroupList = Object.keys(provinceGroupedList).map(d => ({
            code: d,
            belowFourteen: provinceGroupedList[d].reduce((acc, val) => acc + val.l0_14, 0),
            fifteenToFourtyNine: provinceGroupedList[d].reduce((acc, val) => acc + val.l15_49, 0),
            aboveFifty: provinceGroupedList[d].reduce((acc, val) => acc + val.l50plus, 0),
            total: provinceGroupedList[d].reduce((acc, val) => acc + val.ltotal, 0),
        }));

        return ageGroupList;
    }, [ageGroupListResponse]);

    const ageGroupListByDistrict = React.useMemo(() => {
        const districtGroupedList = listToGroupList(
            sanitizedAgeGroupList,
            d => d.districtId,
        );

        const ageGroupList = Object.keys(districtGroupedList).map(d => ({
            code: d,
            belowFourteen: districtGroupedList[d].reduce((acc, val) => acc + val.l0_14, 0),
            fifteenToFourtyNine: districtGroupedList[d].reduce((acc, val) => acc + val.l15_49, 0),
            aboveFifty: districtGroupedList[d].reduce((acc, val) => acc + val.l50plus, 0),
            total: districtGroupedList[d].reduce((acc, val) => acc + val.ltotal, 0),
        }));

        return ageGroupList;
    }, [ageGroupListResponse]);

    const ageGroupListByMunicipality = React.useMemo(() => {
        const ageGroupList = sanitizedAgeGroupList.map(d => ({
            code: d.munid,
            belowFourteen: d.l0_14,
            fifteenToFourtyNine: d.l15_49,
            aboveFifty: d.l50plus,
            total: d.ltotal,
        }));

        return ageGroupList;
    }, [ageGroupListResponse]);

    let ageGroupList = [];
    switch (regionLevel) {
        case 'province':
            ageGroupList = ageGroupListByProvince;
            break;
        case 'district':
            ageGroupList = ageGroupListByDistrict;
            break;
        case 'municipality':
            ageGroupList = ageGroupListByMunicipality;
            break;
        default:
            break;
    }

    return [
        ageGroupListPending,
        ageGroupList,
    ];
}

interface IndicatorValue {
    code: number;
    value: number;
}

export function useMapStateForIndicator(
    regionLevel: RegionLevelOption,
    selectedIndicator: number | undefined,
    selectedAgeGroup: AgeGroupOption | undefined,
): [boolean, MapState[]] {
    let regionIndicatorUrl;

    if (isDefined(selectedIndicator) && String(selectedIndicator) !== '-1') {
        console.warn(selectedIndicator);

        switch (regionLevel) {
            case 'municipality':
                regionIndicatorUrl = `${apiEndPoint}/municipality-indicator/?indicator_id=${selectedIndicator}`;
                break;
            case 'district':
                regionIndicatorUrl = `${apiEndPoint}/district-indicator/${selectedIndicator}`;
                break;
            case 'province':
                regionIndicatorUrl = `${apiEndPoint}/province-indicator/${selectedIndicator}`;
                break;
            default:
                break;
        }
    }

    const [
        regionIndicatorListPending,
        regionIndicatorListResponse,
    ] = useRequest<IndicatorValue>(regionIndicatorUrl);

    const [
        ageGroupListPending,
        ageGroupList,
    ] = useAgeGroupList(String(selectedIndicator) === '-1', regionLevel);

    let mapState: MapState[] = [];
    if (String(selectedIndicator) === '-1' && selectedAgeGroup) {
        mapState = ageGroupList.map(d => ({
            id: d.code,
            value: d[selectedAgeGroup],
        }));
    } else {
        mapState = regionIndicatorListResponse.results.map(d => ({
            id: d.code,
            value: d.value,
        }));
    }

    const pending = regionIndicatorListPending || ageGroupListPending;
    return [pending, mapState];
}
