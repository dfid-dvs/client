import { isDefined } from '@togglecorp/fujs';
import {
    MultiResponse,
    RegionLevelOption,
    MapStateItem,
    IndicatorValue,
} from '#types';

import { apiEndPoint } from '#utils/constants';
import { prepareUrlParams as p } from '#utils/common';

import useRequest from '#hooks/useRequest';

function useMapStateForIndicator(
    regionLevel: RegionLevelOption,
    selectedIndicator: number | undefined,
    preserveResponse = false,
): [boolean, MapStateItem[]] {
    const regionIndicatorParams = isDefined(selectedIndicator) && String(selectedIndicator) !== '-1'
        ? p({
            // eslint-disable-next-line camelcase
            indicator_id: selectedIndicator,
        })
        : undefined;

    const regionIndicatorUrl = regionIndicatorParams
        ? `${apiEndPoint}/core/${regionLevel}-indicator/?${regionIndicatorParams}`
        : undefined;

    const [
        regionIndicatorListPending,
        regionIndicatorListResponse,
    ] = useRequest<MultiResponse<IndicatorValue>>(regionIndicatorUrl, 'indicator', undefined, preserveResponse);

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
