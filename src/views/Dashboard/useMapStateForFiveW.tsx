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
    FiveWOptionKey,
} from './types';

function useMapStateForFiveW(
    regionLevel: RegionLevelOption,
    selectedFiveWOption: FiveWOptionKey | undefined,
): [boolean, MapStateItem[], FiveW[]] {
    const regionFiveWGetUrl = selectedFiveWOption
        ? `${apiEndPoint}/core/fivew-${regionLevel}/`
        : undefined;

    const [
        regionFiveWPending,
        regionFiveWListResponse,
    ] = useRequest<MultiResponse<FiveW>>(regionFiveWGetUrl, 'fivew');

    const filteredRegionFivewW = regionFiveWListResponse?.results.filter(item => item.code !== '-1');

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

    const fiveW: FiveW[] = filteredRegionFivewW || [];

    return [regionFiveWPending, fiveWMapState, fiveW];
}

export default useMapStateForFiveW;