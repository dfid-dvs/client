import { useMemo } from 'react';
import { listToMap } from '@togglecorp/fujs';
import {
    MultiResponse,
    RegionLevelOption,
} from '#types';
import { apiEndPoint } from '#utils/constants';

import useRequest from '#hooks/useRequest';

import {
    FiveW,
    OriginalFiveW,
} from './types';

export interface ExtendedFiveW extends FiveW {
    indicators: {
        [key: number]: number | undefined;
    };
}
interface IndicatorValue {
    indicatorId: number;
    code: string;
    value: number;
}

function useExtendedFiveW(
    regionLevel: RegionLevelOption,
    programs: number[],
    indicators: number[],
    preserveResponse = true,
): [boolean, ExtendedFiveW[]] {
    const regionFiveWGetUrl = `${apiEndPoint}/core/fivew-${regionLevel}/`;
    const regionFiveWGetOptions: RequestInit | undefined = useMemo(
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
    ] = useRequest<MultiResponse<OriginalFiveW>>(
        regionFiveWGetUrl,
        'fivew',
        regionFiveWGetOptions,
        preserveResponse,
    );

    const fiveWList: FiveW[] | undefined = regionFiveWListResponse?.results
        .filter(item => item.code !== '-1')
        .map(item => ({
            ...item,
            partnerCount: item.partner.length,
            componentCount: item.component.length,
            sectorCount: item.sector.length,
        }));

    // Get indicator value
    const regionIndicatorOptions: RequestInit | undefined = useMemo(
        () => (indicators.length > 0 ? {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                indicatorId: indicators,
            }),
        } : undefined),
        [indicators],
    );

    let regionIndicatorUrl: string | undefined;
    if (indicators.length > 0) {
        regionIndicatorUrl = `${apiEndPoint}/core/${regionLevel}-indicator/`;
    }
    const [
        regionIndicatorListPending,
        regionIndicatorListResponse,
    ] = useRequest<MultiResponse<IndicatorValue>>(regionIndicatorUrl, 'indicator', regionIndicatorOptions);

    const extendedFiveW: ExtendedFiveW[] = useMemo(
        () => {
            if (!fiveWList) {
                return [];
            }
            const mapping = listToMap(
                regionIndicatorListResponse?.results,
                item => `${item.code}-${item.indicatorId}`,
                item => item.value,
            );
            return fiveWList.map(item => ({
                ...item,
                indicators: listToMap(
                    indicators,
                    id => id,
                    id => mapping[`${item.code}-${id}`],
                ),
            }));
        },
        [fiveWList, regionIndicatorListResponse, indicators],
    );

    return [regionFiveWPending || regionIndicatorListPending, extendedFiveW];
}

export default useExtendedFiveW;
