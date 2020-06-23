import { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    MultiResponse,
    RegionLevelOption,
    MapStateItem,
} from '#types';

import { apiEndPoint } from '#utils/constants';

import useRequest from '#hooks/useRequest';

interface IndicatorValue {
    code: string;
    value: number;
}

function useMapStateForIndicator(
    regionLevel: RegionLevelOption,
    selectedIndicator: number | undefined,
    preserveResponse = false,
): [boolean, MapStateItem[]] {
    let regionIndicatorUrl: string | undefined;

    const options: RequestInit | undefined = useMemo(
        () => (selectedIndicator ? {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                indicatorId: [selectedIndicator],
            }),
        } : undefined),
        [selectedIndicator],
    );

    if (isDefined(selectedIndicator) && String(selectedIndicator) !== '-1') {
        regionIndicatorUrl = `${apiEndPoint}/core/${regionLevel}-indicator/`;
    }

    const [
        regionIndicatorListPending,
        regionIndicatorListResponse,
    ] = useRequest<MultiResponse<IndicatorValue>>(regionIndicatorUrl, 'indicator', options, preserveResponse);

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
