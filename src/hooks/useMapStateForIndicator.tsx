import { isDefined } from '@togglecorp/fujs';
import {
    MultiResponse,
    RegionLevelOption,
    MapStateItem,
} from '#types';

import { apiEndPoint } from '#utils/constants';

import useRequest from './useRequest';

interface IndicatorValue {
    code: string;
    value: number;
}

function useMapStateForIndicator(
    regionLevel: RegionLevelOption,
    selectedIndicator: number | undefined,
): [boolean, MapStateItem[]] {
    let regionIndicatorUrl: string | undefined;
    if (isDefined(selectedIndicator) && String(selectedIndicator) !== '-1') {
        regionIndicatorUrl = `${apiEndPoint}/core/${regionLevel}-indicator/?indicator_id=${selectedIndicator}`;
    }

    const [
        regionIndicatorListPending,
        regionIndicatorListResponse,
    ] = useRequest<MultiResponse<IndicatorValue>>(regionIndicatorUrl, 'indicator');

    let mapState: MapStateItem[] = [];
    if (regionIndicatorListResponse && isDefined(selectedIndicator)) {
        mapState = regionIndicatorListResponse.results.map(d => ({
            id: +d.code,
            value: d.value,
        }));
    }

    return [regionIndicatorListPending, mapState];
}

export default useMapStateForIndicator;
