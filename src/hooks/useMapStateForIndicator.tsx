import { isDefined } from '@togglecorp/fujs';
import {
    MultiResponse,
    RegionLevelOption,
    AgeGroupOption,
    MapState,
} from '#types';

import { apiEndPoint } from '#utils/constants';

import useRequest from './useRequest';
import useAgeGroupList from './useAgeGroupList';

interface IndicatorValue {
    code: number;
    value: number;
}

function useMapStateForIndicator(
    regionLevel: RegionLevelOption,
    selectedIndicator: number | undefined,
    selectedAgeGroup: AgeGroupOption | undefined,
): [boolean, MapState[]] {
    let regionIndicatorUrl;

    if (isDefined(selectedIndicator) && String(selectedIndicator) !== '-1') {
        switch (regionLevel) {
            case 'municipality':
                regionIndicatorUrl = `${apiEndPoint}/municipality-indicator/?indicator_id=${selectedIndicator}/`;
                break;
            case 'district':
                regionIndicatorUrl = `${apiEndPoint}/district-indicator/${selectedIndicator}/`;
                break;
            case 'province':
                regionIndicatorUrl = `${apiEndPoint}/province-indicator/${selectedIndicator}/`;
                break;
            default:
                break;
        }
    }

    const [
        regionIndicatorListPending,
        regionIndicatorListResponse,
    ] = useRequest<MultiResponse<IndicatorValue>>(regionIndicatorUrl);

    const [
        ageGroupListPending,
        ageGroupList,
    ] = useAgeGroupList(String(selectedIndicator) === '-1', regionLevel);

    let mapState: MapState[] = [];
    if (String(selectedIndicator) === '-1' && selectedAgeGroup) {
        mapState = ageGroupList.map(d => ({
            id: d.code,
            value: d[selectedAgeGroup],
        }));
    } else if (regionIndicatorListResponse) {
        mapState = regionIndicatorListResponse.results.map(d => ({
            id: d.code,
            value: d.value,
        }));
    }

    const pending = regionIndicatorListPending || ageGroupListPending;
    return [pending, mapState];
}

export default useMapStateForIndicator;
