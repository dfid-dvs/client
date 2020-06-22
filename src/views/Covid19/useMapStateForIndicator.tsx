import { isDefined } from '@togglecorp/fujs';
import {
    RegionLevelOption,
    MapStateItem,
} from '#types';
import useMapStateForIndicator from '#hooks/useMapStateForIndicator';

import { AgeGroupOption } from './types';
import useAgeGroupList from './useAgeGroupList';

function useMapStateForIndicatorWithAgeGroup(
    regionLevel: RegionLevelOption,
    selectedIndicator: number | undefined,
    selectedAgeGroup: AgeGroupOption | undefined,
): [boolean, MapStateItem[]] {
    const [pendingIndicator, response] = useMapStateForIndicator(
        regionLevel,
        selectedIndicator,
        false,
    );

    const [
        ageGroupListPending,
        ageGroupList,
    ] = useAgeGroupList(selectedIndicator === -1, regionLevel);

    let mapState: MapStateItem[] = [];
    if (
        isDefined(selectedIndicator)
        && selectedIndicator === -1
        && selectedAgeGroup
    ) {
        mapState = ageGroupList.map(d => ({
            id: d.code,
            value: d[selectedAgeGroup],
        }));
    } else if (response) {
        mapState = response;
    }

    const pending = pendingIndicator || ageGroupListPending;
    return [pending, mapState];
}

export default useMapStateForIndicatorWithAgeGroup;
