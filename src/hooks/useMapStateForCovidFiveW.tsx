import { useMemo } from 'react';
import { isDefined, listToGroupList, unique } from '@togglecorp/fujs';
import {
    MultiResponse,
    RegionLevelOption,
    CovidFiveW,
    MapState,
    CovidFiveWRegionKey,
    CovidFiveWOptionKey,
    Province,
    District,
    Municipality,
} from '#types';

import { apiEndPoint } from '#utils/constants';
import useRequest from './useRequest';

function useMapStateForCovidFiveW(
    regionLevel: RegionLevelOption,
    selectedFiveWOption: CovidFiveWOptionKey | undefined,
): [boolean, MapState[]] {
    let regionFiveWGetUrl;
    let provinceUrl;
    let districtUrl;
    let municipalityUrl;

    if (isDefined(selectedFiveWOption)) {
        regionFiveWGetUrl = 'https://dvsnaxa.naxa.com.np/covid/covid-fivew/';
        municipalityUrl = `${apiEndPoint}/gapanapa/`; // FIXME: should use /municipality/
        districtUrl = `${apiEndPoint}/district/`;
        provinceUrl = `${apiEndPoint}/province/`;
    }

    const [
        provincePending,
        provinceListResponse,
    ] = useRequest<MultiResponse<Province>>(provinceUrl);

    const [
        districtPending,
        districtListResponse,
    ] = useRequest<MultiResponse<District>>(districtUrl);

    const [
        municipalityPending,
        municipalityListResponse,
    ] = useRequest<MultiResponse<Municipality>>(municipalityUrl);

    const [
        regionFiveWPending,
        regionFiveWListResponse,
    ] = useRequest<MultiResponse<CovidFiveW>>(regionFiveWGetUrl);

    const fiveWMapState: MapState[] = useMemo(
        () => {
            if (!regionFiveWListResponse
                || !selectedFiveWOption
                || !provinceListResponse
                || !districtListResponse
                || !municipalityListResponse
            ) {
                return [];
            }

            let exhaustiveFiveWList: CovidFiveW[] = [];
            const fiveWAllProvince = regionFiveWListResponse.results.filter(v => v.provinceCode === '-1')
                .map(fw => (
                    provinceListResponse.results.map(province => ({
                        ...fw,
                        provinceCode: province.code,
                        districtCode: '-1',
                        municipalityCode: '-1',
                    })))).flat();

            exhaustiveFiveWList = [...fiveWAllProvince, ...regionFiveWListResponse.results.filter(v => v.provinceCode !== '-1')];

            const fiveWAllDistrict = exhaustiveFiveWList.filter(v => v.districtCode === '-1')
                .map((fw) => {
                    const districts = districtListResponse.results.filter((d) => {
                        const fwProvinceId = provinceListResponse
                            .results.find(p => p.code === fw.provinceCode)?.id;
                        return d.provinceId === fwProvinceId;
                    });
                    return districts.map(district => ({
                        ...fw,
                        districtCode: district.code,
                        municipalityCode: '-1',
                    }));
                }).flat();

            exhaustiveFiveWList = [...fiveWAllDistrict, ...exhaustiveFiveWList.filter(v => v.districtCode !== '-1')];

            const fiveWAllMunicipality = exhaustiveFiveWList
                .filter(v => v.municipalityCode === '-1')
                .map((fw) => {
                    const municipalities = municipalityListResponse.results.filter((m) => {
                        const fwDistrictId = districtListResponse
                            .results.find(d => d.code === fw.municipalityCode)?.id;
                        return m.districtId === fwDistrictId;
                    });
                    return municipalities.map(municipality => ({
                        ...fw,
                        municipalityCode: municipality.code,
                    }));
                }).flat();

            exhaustiveFiveWList = [
                ...fiveWAllMunicipality,
                ...exhaustiveFiveWList.filter(v => v.municipalityCode !== '-1'),
            ];

            let regionKey: CovidFiveWRegionKey = 'provinceCode';
            switch (regionLevel) {
                case 'province': {
                    regionKey = 'provinceCode';
                    break;
                }
                case 'district': {
                    regionKey = 'districtCode';
                    break;
                }
                case 'municipality': {
                    regionKey = 'municipalityCode';
                    break;
                }
                default: {
                    break;
                }
            }

            const groupedRegionData = listToGroupList(
                exhaustiveFiveWList,
                data => data[regionKey],
            );
            const mapState = Object.entries(groupedRegionData).map(([key, value]) => {
                const options = unique(value.map(v => v[selectedFiveWOption]));
                return {
                    id: +key,
                    value: (options?.length || 0),
                };
            });
            return mapState;
        },
        [
            regionFiveWListResponse,
            selectedFiveWOption,
            regionLevel,
            provinceListResponse,
            districtListResponse,
            municipalityListResponse,
        ],
    );

    const pending = regionFiveWPending || provincePending || districtPending || municipalityPending;
    return [pending, fiveWMapState];
}

export default useMapStateForCovidFiveW;
