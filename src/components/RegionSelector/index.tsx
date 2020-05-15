import React, { useMemo, useCallback } from 'react';

import useRequest from '#hooks/useRequest';
import { apiEndPoint } from '#utils/constants';
import {
    MultiResponse,
    NavbarContextProps,
    RegionLevelOption,
} from '#types';

import MultiSelectInput from '#components/MultiSelectInput';
import SegmentInput from '#components/SegmentInput';
import NavbarContext from '#components/NavbarContext';

import styles from './styles.css';

interface Province {
    id: number;
    name: string;
    code: string;
    boundary: string;
}
interface District {
    id: number;
    provinceId: number;
    provinceName: string;
    name: string;
    code: string;
    nCode: number;
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
}

type Region = Province | District | Municipality;
const regionKeySelector = (region: Region) => region.id;
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
}
function RegionSelector(props: Props) {
    const {
        className,
        searchHidden,
    } = props;

    // FIXME: this must be a multi-select input
    const [
        selectedRegions,
        setSelectedRegions,
    ] = React.useState<number[] | undefined>(undefined);

    const {
        regionLevel,
        setRegionLevel,
    } = React.useContext<NavbarContextProps>(NavbarContext);

    const setRegionLevelSafely = useCallback(
        (r: RegionLevelOption) => {
            setRegionLevel(r);
            setSelectedRegions(undefined);
        },
        [setRegionLevel],
    );

    const regionLevelLabel = useMemo(
        () => (
            regionLevelOptionList.find(v => v.key === regionLevel)?.label
        ),
        [regionLevel],
    );

    const regionGetRequest = searchHidden ? undefined : `${apiEndPoint}/core/${regionLevel}/`;
    const regionSchema = regionLevel;

    const [
        regionListPending,
        regionListResponse,
    ] = useRequest<MultiResponse<Region>>(regionGetRequest, regionSchema);

    return (
        <div className={className}>
            <SegmentInput
                className={styles.regionLevelSelection}
                label="Admin Level"
                options={regionLevelOptionList}
                optionKeySelector={regionLevelOptionListKeySelector}
                optionLabelSelector={regionLevelOptionListLabelSelector}
                value={regionLevel}
                onChange={setRegionLevelSafely}
            />
            {!searchHidden && (
                <MultiSelectInput
                    placeholder={`Select ${regionLevelLabel}`}
                    className={styles.regionSelectInput}
                    disabled={regionListPending}
                    options={regionListResponse?.results}
                    onChange={setSelectedRegions}
                    value={selectedRegions}
                    optionLabelSelector={regionLabelSelector}
                    optionKeySelector={regionKeySelector}
                />
            )}
        </div>
    );
}
export default RegionSelector;
