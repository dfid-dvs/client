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

export interface Province {
    id: number;
    name: string;
    code: string;
    boundary: string;
    bbox: string;
}

export interface District {
    id: number;
    provinceId: number;
    provinceName: string;
    name: string;
    code: string;
    nCode: number;
    bbox: string;
}

export interface Municipality {
    id: number;
    name: string;
    provinceId: number;
    districtId: number;
    hlcitCode: string;
    gnTypeNp: string;
    code: string;
    population: number;
    bbox: string;
    provinceName: string;
    districtName: string;
}

type Region = Province | District | Municipality;

const regionKeySelector = (region: Region) => +region.code;
const regionLabelSelector = (region: Region) => region.name;

// FIXME: shouldn't cast explicitly
const districtGroupSelector = (region: Region) => (region as District).provinceName;
const municiplityGroupSelector = (region: Region) => (region as Municipality).districtName;

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

    segmentLabel?: string;
    segmentLabelClassName?: string;
    segmentInputClassName?: string;
    selectInputClassName?: string;
    showDropDownIcon?: boolean;
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
        segmentLabel = '',
        segmentLabelClassName,
        segmentInputClassName,
        selectInputClassName,
        showDropDownIcon = false,
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
    const handleSelectedRegionChange = useCallback((selectedRegionCode?: number) => {
        if (setSelectedRegion) {
            const selectedRegionObj = regionListResponse?.results
                ?.find(r => r.code === String(selectedRegionCode));

            setSelectedRegion(selectedRegionCode, selectedRegionObj);
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
                    className={_cs(styles.regionLevelSelection, segmentInputClassName)}
                    options={regionLevelOptionList}
                    optionKeySelector={regionLevelOptionListKeySelector}
                    optionLabelSelector={regionLevelOptionListLabelSelector}
                    value={regionLevel}
                    onChange={setRegionLevelSafely}
                    disabled={disabled}
                    label={segmentLabel}
                    labelClassName={segmentLabelClassName}
                />
            )}
            {!searchHidden && setSelectedRegion && (
                <SelectInput
                    pending={regionListPending}
                    placeholder={`Select ${regionLevelLabel}`}
                    className={_cs(styles.regionSelectInput, selectInputClassName)}
                    disabled={regionListPending || disabled}
                    options={regionListResponse?.results}
                    onChange={handleSelectedRegionChange}
                    value={selectedRegion}
                    optionLabelSelector={regionLabelSelector}
                    groupKeySelector={
                        (regionLevel === 'municipality' && municiplityGroupSelector)
                        || (regionLevel === 'district' && districtGroupSelector)
                        || undefined
                    }
                    // groupKeySelector={regionGroupSelector}
                    optionKeySelector={regionKeySelector}
                    showDropDownIcon={showDropDownIcon}
                />
            )}
        </div>
    );
}

export default RegionSelector;
