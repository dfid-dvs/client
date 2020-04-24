import { useMemo } from 'react';
import {
    listToGroupList,
    sum,
} from '@togglecorp/fujs';

import { RegionLevelOption } from '#types';

import useRequest from './useRequest';

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


    const ageGroupList = useMemo(
        () => {
            if (!ageGroupListResponse) {
                return [];
            }

            // NOTE: this municipality has a very large value so skipping it
            const sanitizedAgeGroupList = ageGroupListResponse.filter(
                d => d.munid !== 38,
            );

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
        },
        [ageGroupListResponse, regionLevel],
    );

    return [
        ageGroupListPending,
        ageGroupList,
    ];
}
export default useAgeGroupList;
