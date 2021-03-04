import { useMemo } from 'react';
import { listToMap } from '@togglecorp/fujs';
import {
    MultiResponse,
    RegionLevelOption,
} from '#types';
import { apiEndPoint } from '#utils/constants';
import {
    UrlParams,
    prepareUrlParams as p,
} from '#utils/common';

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
    regionLevel: RegionLevelOption | undefined,
    markerIdList: number[] | undefined,
    submarkerIdList: number[] | undefined,
    programIdList: number[] | undefined,
    componentIdList: number[] | undefined,
    partnerIdList: number[] | undefined,
    sectorIdList: number[] | undefined,
    subsectorIdList: number[] | undefined,
    indicators: number[],
    preserveResponse = true,
    extraUrlParams: UrlParams = {},
): [boolean, ExtendedFiveW[]] {
    const regionUrlParams = p({
        // eslint-disable-next-line @typescript-eslint/camelcase
        marker_category_id: markerIdList,
        // eslint-disable-next-line @typescript-eslint/camelcase
        marker_value_id: submarkerIdList,
        // eslint-disable-next-line @typescript-eslint/camelcase
        program_id: programIdList,
        // eslint-disable-next-line @typescript-eslint/camelcase
        component_id: componentIdList,
        // eslint-disable-next-line @typescript-eslint/camelcase
        supplier_id: partnerIdList,
        // eslint-disable-next-line @typescript-eslint/camelcase
        sector_id: sectorIdList,
        // eslint-disable-next-line @typescript-eslint/camelcase
        sub_sector_id: subsectorIdList,
        ...extraUrlParams,
    });
    const regionFiveWGetUrl = regionUrlParams
        ? `${apiEndPoint}/core/fivew-${regionLevel}/?${regionUrlParams}`
        : `${apiEndPoint}/core/fivew-${regionLevel}/`;

    const [
        regionFiveWPending,
        regionFiveWListResponse,
    ] = useRequest<MultiResponse<OriginalFiveW>>(
        // FIXME: better way to handle this
        regionLevel ? regionFiveWGetUrl : undefined,
        `fivew-${regionLevel}`,
        undefined,
        preserveResponse,
    );

    const fiveWList: FiveW[] | undefined = regionFiveWListResponse?.results
        .filter(item => item.code !== '-1')
        .map(item => ({
            ...item,
            programCount: item.program.length,
            partnerCount: item.partner.length,
            componentCount: item.component.length,
            sectorCount: item.sector.length,
        }));

    const regionIndicatorParams = indicators.length > 0
        ? p({
            // eslint-disable-next-line @typescript-eslint/camelcase
            indicator_id: indicators,
            offset: 0,
            limit: 774 * 20,
        })
        : undefined;

    const regionIndicatorUrl = regionIndicatorParams
        ? `${apiEndPoint}/core/${regionLevel}-indicator/?${regionIndicatorParams}`
        : undefined;

    const [
        regionIndicatorListPending,
        regionIndicatorListResponse,
    ] = useRequest<MultiResponse<IndicatorValue>>(regionIndicatorUrl, 'indicator');

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
