import { useMemo } from 'react';
import {
    MultiResponse,
    RegionLevelOption,
    FiveW,
    MapState,
    FiveWOptionKey,
} from '#types';
import { apiEndPoint } from '#utils/constants';

import useRequest from './useRequest';

function useMapStateForFiveW(
    regionLevel: RegionLevelOption,
    selectedFiveWOption: FiveWOptionKey | undefined,
): [boolean, MapState[]] {
    const regionFiveWGetUrl = selectedFiveWOption
        ? `${apiEndPoint}/core/fivew-${regionLevel}/`
        : undefined;

    const [
        regionFiveWPending,
        regionFiveWListResponse,
    ] = useRequest<MultiResponse<FiveW>>(regionFiveWGetUrl);

    const fiveWMapState: MapState[] = useMemo(
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
