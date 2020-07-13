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
    programs: number[],
    selectedFiveWOption?: FiveWOptionKey,
    preserveResponse = false,
    filter?: { field?: string; value?: string },
): [boolean, MapStateItem[], FiveW[]] {
    let params: UrlParams = {
        // eslint-disable-next-line @typescript-eslint/camelcase
        program_id: programs,
    };
    if (filter && filter.field && filter.value) {
        params = {
            ...filter,
        };
    }
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
