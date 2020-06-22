import { useMemo } from 'react';
import {
    MultiResponse,
    RegionLevelOption,
    MapStateItem,
} from '#types';
import { apiEndPoint } from '#utils/constants';

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
    preserveResponse = true,
): [boolean, MapStateItem[], FiveW[]] {
    const regionFiveWGetUrl = `${apiEndPoint}/core/fivew-${regionLevel}/`;

    const options: RequestInit | undefined = useMemo(
        () => ({
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                programId: programs,
            }),
        }),
        [programs],
    );

    const [
        regionFiveWPending,
        regionFiveWListResponse,
    ] = useRequest<MultiResponse<OriginalFiveW>>(regionFiveWGetUrl, 'fivew', options, preserveResponse);

    const filteredRegionFivewW = regionFiveWListResponse?.results
        .filter(item => item.code !== '-1')
        .map(item => ({
            ...item,
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
