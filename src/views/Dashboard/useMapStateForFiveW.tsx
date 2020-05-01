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
): [boolean, MapStateItem[]] {
    const regionFiveWGetUrl = selectedFiveWOption
        ? `${apiEndPoint}/core/fivew-${regionLevel}/`
        : undefined;

    const [
        regionFiveWPending,
        regionFiveWListResponse,
    ] = useRequest<MultiResponse<FiveW>>(regionFiveWGetUrl);

    const fiveWMapState: MapStateItem[] = useMemo(
        () => {
            if (!regionFiveWListResponse || !selectedFiveWOption) {
                return [];
            }

            return regionFiveWListResponse?.results.map(d => ({
                id: d.code,
                value: d[selectedFiveWOption],
            }));
        },
        [regionFiveWListResponse, selectedFiveWOption],
    );

    return [regionFiveWPending, fiveWMapState];
}

export default useMapStateForFiveW;
