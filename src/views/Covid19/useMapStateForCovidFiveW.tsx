import { useMemo } from 'react';
import { isDefined, listToGroupList, unique } from '@togglecorp/fujs';
import {
    MultiResponse,
    RegionLevelOption,
    Province,
    District,
    Municipality,
} from '#types';

import { apiEndPoint } from '#utils/constants';
import useRequest from '#hooks/useRequest';

import {
    CovidFiveW,
    MapStateFiveWData,
    CovidFiveWRegionKey,
    CovidFiveWOptionKey,
} from './types';

function useMapStateForCovidFiveW(
    regionLevel: RegionLevelOption,
    selectedFiveWOption: CovidFiveWOptionKey | undefined,
): [boolean, MapStateFiveWData[]] {
    let covidSpecificProgramGetUrl;
    let provinceUrl;
    let districtUrl;
    let municipalityUrl;

    if (isDefined(selectedFiveWOption)) {
        covidSpecificProgramGetUrl = `${apiEndPoint}/covid/covid-specific-program/`;
        municipalityUrl = `${apiEndPoint}/core/municipality/`;
        districtUrl = `${apiEndPoint}/core/district/`;
        provinceUrl = `${apiEndPoint}/core/province/`;
    }

    const [
        provincePending,
        provinceListResponse,
    ] = useRequest<MultiResponse<Province>>(provinceUrl, 'province');

    const [
        districtPending,
        districtListResponse,
    ] = useRequest<MultiResponse<District>>(districtUrl, 'district');

    const [
        municipalityPending,
        municipalityListResponse,
    ] = useRequest<MultiResponse<Municipality>>(municipalityUrl, 'municipality');

    const [
        regionFiveWPending,
        regionFiveWListResponse,
    ] = useRequest<MultiResponse<CovidFiveW>>(covidSpecificProgramGetUrl, 'covid-program-list');

    const fiveWMapState: MapStateFiveWData[] = useMemo(
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
            const fiveWAllProvince = regionFiveWListResponse.results
                .filter(v => v.provinceCode === '-1')
                .map(fw => (
                    provinceListResponse.results.map(province => ({
                        ...fw,
                        provinceCode: province.code,
                        districtCode: '-1',
                        municipalityCode: '-1',
                    })))).flat();

            exhaustiveFiveWList = [
                ...fiveWAllProvince,
                ...regionFiveWListResponse.results.filter(v => v.provinceCode !== '-1'),
            ];

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

            exhaustiveFiveWList = [
                ...fiveWAllDistrict,
                ...exhaustiveFiveWList.filter(v => v.districtCode !== '-1'),
            ];

            const fiveWAllMunicipality = exhaustiveFiveWList
                .filter(v => v.municipalityCode === '-1')
                .map((fw) => {
                    const municipalities = municipalityListResponse.results.filter((m) => {
                        const fwDistrictId = districtListResponse
                            .results.find(d => d.code === fw.districtCode)?.id;
                        return m.districtId === fwDistrictId;
                    });
                    return municipalities.map(municipality => ({
                        ...fw,
                        municipalityCode: String(municipality.code),
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
                exhaustiveFiveWList.filter(item => isDefined(item[regionKey])),
                // NOTE: we can set this as string as we have filtered exhaustiveFiveWList
                data => data[regionKey] as string,
            );
            const mapState = Object.entries(groupedRegionData).map(([key, value]) => {
                const options = unique(value.map(v => v[selectedFiveWOption]));
                return {
                    id: +key,
                    value: (options?.length || 0),
                    data: value,
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