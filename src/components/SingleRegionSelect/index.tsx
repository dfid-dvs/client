import React, { useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import useRequest from '#hooks/useRequest';
import { apiEndPoint } from '#utils/constants';
import {
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
    type: 'province';
}

interface District {
    id: number;
    provinceId: number;
    provinceName: string;
    name: string;
    code: string;
    nCode: number;
    bbox: string;
    type: 'district';
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
    type: 'municipality';
}

export type Region = Province | District | Municipality;

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
    disabled?: boolean;

    regionLevel: RegionLevelOption;
    onRegionLevelChange?: (regionLevel: RegionLevelOption) => void;

    region: number | undefined;
    onRegionChange?: (item: number | undefined, obj: Region | undefined) => void;
}
function RegionSelector(props: Props) {
    const {
        className,
        disabled,
        searchHidden,
        selectionHidden,
        onRegionLevelChange,
        regionLevel,
        region: selectedRegion,
        onRegionChange: setSelectedRegion,
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
            const selectedRegionObj = regionListResponse?.results
                ?.find(r => r.code === String(selectedRegionId));

            setSelectedRegion(selectedRegionId, selectedRegionObj);
        }
    }, [setSelectedRegion, regionListResponse]);

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
                    disabled={disabled}
                />
            )}
            {!searchHidden && setSelectedRegion && (
                <SelectInput
                    pending={regionListPending}
                    label={regionLevelLabel}
                    placeholder={`Select ${regionLevelLabel}`}
                    className={styles.regionSelectInput}
                    disabled={regionListPending || disabled}
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
