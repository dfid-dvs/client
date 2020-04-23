import { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';
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
    let regionFiveWGetUrl;
    if (isDefined(selectedFiveWOption)) {
        switch (regionLevel) {
            case 'municipality':
                regionFiveWGetUrl = `${apiEndPoint}/fivew-municipality/`;
                break;
            case 'district':
                regionFiveWGetUrl = `${apiEndPoint}/fivew-district/`;
                break;
            case 'province':
                regionFiveWGetUrl = `${apiEndPoint}/fivew-province/`;
                break;
            default:
                break;
        }
    }

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