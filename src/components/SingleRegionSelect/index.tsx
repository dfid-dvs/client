import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import useRequest from '#hooks/useRequest';
import { apiEndPoint } from '#utils/constants';
import {
    Bbox,
    MultiResponse,
    RegionLevelOption,
} from '#types';

import SelectInput from '#components/SelectInput';
import SegmentInput from '#components/SegmentInput';

import styles from './styles.css';

interface Province {
    id: number;
    name: string;
    code: string;
    boundary: string;
    bbox: string;
}
interface District {
    id: number;
    provinceId: number;
    provinceName: string;
    name: string;
    code: string;
    nCode: number;
    bbox: string;
}

interface Municipality {
    id: number;
    name: string;
    provinceId: number;
    districtId: number;
    hlcitCode: string;
    gnTypeNp: string;
    code: string;
    population: number;
    bbox: string;
}

type Region = Province | District | Municipality;
const regionKeySelector = (region: Region) => +region.code;
const regionLabelSelector = (region: Region) => region.name;


interface RegionLevelOptionListItem {
    key: RegionLevelOption;
    label: string;
}
const regionLevelOptionListKeySelector = (d: RegionLevelOptionListItem) => d.key;
const regionLevelOptionListLabelSelector = (d: RegionLevelOptionListItem) => d.label;

const regionLevelOptionList: RegionLevelOptionListItem[] = [
    { key: 'province', label: 'Province' },
    { key: 'district', label: 'District' },
    { key: 'municipality', label: 'Municipality' },
];

interface Props {
    className?: string;
    searchHidden?: boolean;
    selectionHidden?: boolean;

    regionLevel: RegionLevelOption;
    onRegionLevelChange?: (regionLevel: RegionLevelOption) => void;

    region: number | undefined;
    onRegionChange?: (item: number | undefined) => void;
    onBoundsChange?: (bounds: Bbox | undefined) => void;
}
function RegionSelector(props: Props) {
    const {
        className,
        searchHidden,
        selectionHidden,
        onRegionLevelChange,
        regionLevel,
        region: selectedRegion,
        onRegionChange: setSelectedRegion,
        onBoundsChange: setBounds,
    } = props;

    const regionGetRequest = searchHidden ? undefined : `${apiEndPoint}/core/${regionLevel}/`;
    const regionSchema = regionLevel;

    const [
        regionListPending,
        regionListResponse,
    ] = useRequest<MultiResponse<Region>>(regionGetRequest, regionSchema);

    const regionLevelLabel = useMemo(
        () => (
            regionLevelOptionList.find(v => v.key === regionLevel)?.label
        ),
        [regionLevel],
    );

    const handleSelectedRegionChange = useCallback((selectedRegionId?: number) => {
        if (setSelectedRegion) {
            setSelectedRegion(selectedRegionId);
        }
        if (setBounds) {
            const selectedRegionObj = regionListResponse?.results
                ?.find(r => r.id === selectedRegionId);

            if (isDefined(selectedRegionObj)) {
                // TODO: Fix from server, currently sends in string
                const bounds = selectedRegionObj.bbox?.split(',');
                const numberBounds: Bbox = bounds.map(b => Number(b));
                setBounds(numberBounds);
            }
        }
    }, [setSelectedRegion, regionListResponse, setBounds]);

    const setRegionLevelSafely = useCallback(
        (r: RegionLevelOption) => {
            if (onRegionLevelChange) {
                onRegionLevelChange(r);
                handleSelectedRegionChange(undefined);
            }
        },
        [onRegionLevelChange, handleSelectedRegionChange],
    );

    return (
        <div className={_cs(className, styles.singleRegionSelect)}>
            {!selectionHidden && (
                <SegmentInput
                    className={styles.regionLevelSelection}
                    label="Admin Level"
                    options={regionLevelOptionList}
                    optionKeySelector={regionLevelOptionListKeySelector}
                    optionLabelSelector={regionLevelOptionListLabelSelector}
                    value={regionLevel}
                    onChange={setRegionLevelSafely}
                />
            )}
            {!searchHidden && setSelectedRegion && (
                <SelectInput
                    pending={regionListPending}
                    label={regionLevelLabel}
                    placeholder={`Select ${regionLevelLabel}`}
                    className={styles.regionSelectInput}
                    disabled={regionListPending}
                    options={regionListResponse?.results}
                    onChange={handleSelectedRegionChange}
                    value={selectedRegion}
                    optionLabelSelector={regionLabelSelector}
                    optionKeySelector={regionKeySelector}
                />
            )}
        </div>
    );
}

export default RegionSelector;
