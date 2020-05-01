import { isDefined } from '@togglecorp/fujs';
import {
    MultiResponse,
    RegionLevelOption,
    MapStateItem,
} from '#types';

import { apiEndPoint } from '#utils/constants';

import useRequest from './useRequest';

interface IndicatorValue {
    code: number;
    value: number;
}

function useMapStateForIndicator(
    regionLevel: RegionLevelOption,
    selectedIndicator: number | undefined,
): [boolean, MapStateItem[]] {
    let regionIndicatorUrl: string | undefined;
    if (isDefined(selectedIndicator) && String(selectedIndicator) !== '-1') {
        switch (regionLevel) {
            case 'municipality':
                regionIndicatorUrl = `${apiEndPoint}/core/municipality-indicator/?indicator_id=${selectedIndicator}`;
                break;
            case 'district':
                regionIndicatorUrl = `${apiEndPoint}/core/district-indicator/${selectedIndicator}/`;
                break;
            case 'province':
                regionIndicatorUrl = `${apiEndPoint}/core/province-indicator/${selectedIndicator}/`;
                break;
            default:
                break;
        }
    }

    const [
        regionIndicatorListPending,
        regionIndicatorListResponse,
    ] = useRequest<MultiResponse<IndicatorValue>>(regionIndicatorUrl);

    let mapState: MapStateItem[] = [];
    if (regionIndicatorListResponse && isDefined(selectedIndicator)) {
        mapState = regionIndicatorListResponse.results.map(d => ({
            id: d.code,
            value: d.value,
        }));
    }

    return [regionIndicatorListPending, mapState];
}

export default useMapStateForIndicator;
