import React from 'react';
import AbortController from 'abort-controller';

import {
    listToGroupList,
    isDefined,
    sum,
} from '@togglecorp/fujs';
import {
    MultiResponse,
    RegionLevelOption,
    AgeGroupOption,
    MapState,
} from '#types';

import { apiEndPoint } from '#utils/constants';

/*
export function useForm<T, K extends keyof T>(
    values: T,
    setValues: (value: T) => void,
    // errors: {} = {},
) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            currentTarget: { value },
            name,
        } = e;

        if (name) {
            setValues({
                ...values,
                [name]: value,
            });
        }
    };

    const formElement = (name: K) => ({
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
*/

const requestOption = {
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
    },
};

export function useRequest<T>(
    url?: string,
    options: object = requestOption,
    // deps: React.DependencyList = [],
): [boolean, T | undefined] {
    const [response, setResponse] = React.useState<T>();
    const [pending, setPending] = React.useState(!!url);

    React.useEffect(
        () => {
            if (!url) {
                return () => {};
            }

            setPending(true);
            const controller = new AbortController();

            async function fetchResource(myUrl: string, myOptions: object | undefined) {
                const { signal } = controller;

                let res;
                try {
                    res = await fetch(myUrl, { ...myOptions, signal });
                } catch (e) {
                    setPending(false);
                    if (!signal.aborted) {
                        console.error(`An error occured while fetching ${myUrl}`, e);
                    }
                    return;
                }

                let resBody;
                try {
                    const resText = await res.text();
                    if (resText.length > 0) {
                        resBody = JSON.parse(resText);
                    }
                } catch (e) {
                    setPending(false);
                    console.error(`An error occured while parsing data from ${myUrl}`, e);
                    return;
                }

                if (res.ok) {
                    setResponse(resBody);
                    setPending(false);
                }
            }

            fetchResource(url, options);

            return () => {
                controller.abort();
            };
        },
        [url, options],
    );

    return [pending, response];
}

export function useBlurEffect(
    shouldWatch: boolean,
    callback: (clickedInside: boolean, e: MouseEvent) => void,
    elementRef: React.RefObject<HTMLElement>,
    parentRef: React.RefObject<HTMLElement>,
) {
    React.useEffect(
        () => {
            if (!shouldWatch) {
                return () => {};
            }

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

            document.addEventListener('click', handleDocumentClick);

            return () => { document.removeEventListener('click', handleDocumentClick); };
        },
        [shouldWatch, callback, elementRef, parentRef],
    );
}

interface AgeGroup {
    id: number;
    munid: number;
    provinceId: number;
    districtId: number;
    hlcit_code: string;
    l0_14: number;
    l15_49: number;
    l50plus: number;
    ltotal: number;
    municipality: null;
    district: number;
}
interface AggregatedAgeGroup {
    code: number;
    belowFourteen: number;
    fifteenToFourtyNine: number;
    aboveFifty: number;
    total: number;
}
function useAgeGroupList(
    shouldUse: boolean,
    regionLevel: RegionLevelOption,
): [boolean, AggregatedAgeGroup[]] {
    const ageGroupListUrl = shouldUse
        ? 'https://covidapi.naxa.com.np/api/v1/age-data/'
        : undefined;

    const [
        ageGroupListPending,
        ageGroupListResponse,
    ] = useRequest<AgeGroup[]>(ageGroupListUrl);

    const sanitizedAgeGroupList = ageGroupListResponse?.filter(
        d => d.munid !== 38,
    );

    const ageGroupList = React.useMemo(() => {
        if (!sanitizedAgeGroupList) {
            return [];
        }

        switch (regionLevel) {
            case 'province': {
                const groupedList = listToGroupList(
                    sanitizedAgeGroupList,
                    d => d.provinceId,
                );
                const ageGroupListForProvince: AggregatedAgeGroup[] = Object.keys(groupedList)
                    .map(d => ({
                        code: +d,
                        belowFourteen: sum(groupedList[d].map(i => i.l0_14)),
                        fifteenToFourtyNine: sum(groupedList[d].map(i => i.l15_49)),
                        aboveFifty: sum(groupedList[d].map(i => i.l50plus)),
                        total: sum(groupedList[d].map(i => i.ltotal)),
                    }));
                return ageGroupListForProvince;
            }
            case 'district': {
                const groupedList = listToGroupList(
                    sanitizedAgeGroupList,
                    d => d.districtId,
                );
                const ageGroupListForDistrict: AggregatedAgeGroup[] = Object.keys(groupedList)
                    .map(d => ({
                        code: +d,
                        belowFourteen: sum(groupedList[d].map(i => i.l0_14)),
                        fifteenToFourtyNine: sum(groupedList[d].map(i => i.l15_49)),
                        aboveFifty: sum(groupedList[d].map(i => i.l50plus)),
                        total: sum(groupedList[d].map(i => i.ltotal)),
                    }));
                return ageGroupListForDistrict;
            }
            case 'municipality': {
                const ageGroupListForMunicipality: AggregatedAgeGroup[] = sanitizedAgeGroupList
                    .map(d => ({
                        code: d.munid,
                        belowFourteen: d.l0_14,
                        fifteenToFourtyNine: d.l15_49,
                        aboveFifty: d.l50plus,
                        total: d.ltotal,
                    }));
                return ageGroupListForMunicipality;
            }
            default: {
                const ageGroupListForNone: AggregatedAgeGroup[] = [];
                return ageGroupListForNone;
            }
        }
    }, [sanitizedAgeGroupList, regionLevel]);

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
    ] = useRequest<MultiResponse<IndicatorValue>>(regionIndicatorUrl);

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
    } else if (regionIndicatorListResponse) {
        mapState = regionIndicatorListResponse.results.map(d => ({
            id: d.code,
            value: d.value,
        }));
    }

    const pending = regionIndicatorListPending || ageGroupListPending;
    return [pending, mapState];
}
