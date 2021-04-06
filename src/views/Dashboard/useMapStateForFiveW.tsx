import { useMemo } from 'react';
import {
    MultiResponse,
    RegionLevelOption,
    MapStateItem,
} from '#types';
import { apiEndPoint } from '#utils/constants';
import { prepareUrlParams as p, UrlParams } from '#utils/common';

import useRequest from '#hooks/useRequest';

import {
    FiveW,
    OriginalFiveW,
    FiveWOptionKey,
} from './types';

function useMapStateForFiveW(
    regionLevel: RegionLevelOption,
    markerIdList: string[] | undefined,
    submarkerIdList: string[] | undefined,
    programIdList: string[] | undefined,
    componentIdList: string[] | undefined,
    partnerIdList: string[] | undefined,
    sectorIdList: string[] | undefined,
    subsectorIdList: string[] | undefined,
    selectedFiveWOption?: FiveWOptionKey,
    preserveResponse = false,
): [boolean, MapStateItem[], FiveW[]] {
    const params: UrlParams = {
        // eslint-disable-next-line camelcase
        marker_category_id: markerIdList,
        // eslint-disable-next-line camelcase
        marker_value_id: submarkerIdList,
        // eslint-disable-next-line camelcase
        program_id: programIdList,
        // eslint-disable-next-line camelcase
        component_code: componentIdList,
        // eslint-disable-next-line camelcase
        supplier_id: partnerIdList,
        // eslint-disable-next-line camelcase
        sector_id: sectorIdList,
        // eslint-disable-next-line camelcase
        sub_sector_id: subsectorIdList,
    };
    const regionUrlParams = p(params);
    const regionFiveWGetUrl = regionUrlParams
        ? `${apiEndPoint}/core/fivew-${regionLevel}/?${regionUrlParams}`
        : `${apiEndPoint}/core/fivew-${regionLevel}/`;

    const [
        regionFiveWPending,
        regionFiveWListResponse,
    ] = useRequest<MultiResponse<OriginalFiveW>>(
        regionFiveWGetUrl,
        `fivew-${regionLevel}`,
        undefined,
        preserveResponse,
    );

    const filteredRegionFivewW = regionFiveWListResponse?.results
        .filter(item => item.code !== '-1')
        .map(item => ({
            ...item,
            programCount: item.program.length,
            partnerCount: item.partner.length,
            componentCount: item.component.length,
            sectorCount: item.sector.length,
        }));

    const fiveW: FiveW[] = filteredRegionFivewW || [];

    const fiveWMapState: MapStateItem[] = useMemo(
        () => {
            if (!filteredRegionFivewW || !selectedFiveWOption) {
                return [];
            }

            return filteredRegionFivewW.map(d => ({
                id: +d.code,
                value: d[selectedFiveWOption],
            }));
        },
        [filteredRegionFivewW, selectedFiveWOption],
    );

    return [regionFiveWPending, fiveWMapState, fiveW];
}

export default useMapStateForFiveW;
