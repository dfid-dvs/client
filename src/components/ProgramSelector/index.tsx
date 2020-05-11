import React, { useMemo } from 'react';
import { _cs, unique, intersection, isDefined } from '@togglecorp/fujs';

import useRequest from '#hooks/useRequest';
import { apiEndPoint } from '#utils/constants';
import { MultiResponse } from '#types';

import SelectInput from '#components/SelectInput';
import DropdownMenu from '#components/DropdownMenu';
import TreeInput from '#components/TreeInput';

import styles from './styles.css';

function commonCount<T>(foo: T[] | undefined, bar: T[] | undefined) {
    return intersection(new Set(foo), new Set(bar)).size;
}

// TODO: move this to utils
// NOTE: join two array together
function join<T>(foo: T[] | undefined, bar: T[] | undefined) {
    if (!foo && !bar) {
        return undefined;
    }
    if (!foo) {
        return bar;
    }
    if (!bar) {
        return foo;
    }
    return [...foo, ...bar];
}

interface Program {
    id: number;
    name: string;
    description: string;
    sector: number[];
    subSector: number[];
    markerCategory: number[];
    markerValue: number[];
    partner: number[];
    code: number;
    budget: number;
}
const programKeySelector = (p: Program) => p.id;
const programLabelSelector = (p: Program) => p.name;

interface Sector {
    id: number;
    name: string;
}

interface SubSector {
    id: number;
    sectorId: number;
    sectorName: string;
    name: string;
    code: string;
}

interface Marker {
    id: number;
    name: string;
}

interface SubMarker {
    id: number;
    value: string;
    markerCategoryId: number;
    markerCategory: string;
}


interface TreeItem {
    key: string;
    id: number;
    parentKey: string | undefined;
    parentId: number | undefined;
    name: string;
}
const treeKeySelector = (item: TreeItem) => item.key;
const treeParentSelector = (item: TreeItem) => item.parentKey;
const treeLabelSelector = (item: TreeItem) => item.name;

interface Props {
    className?: string;
}
function ProgramSelector(props: Props) {
    const {
        className,
    } = props;

    // FIXME: change this to selected programmes
    const [
        selectedProgram,
        setSelectedProgram,
    ] = React.useState<number | undefined>(undefined);

    const [
        selectedSector,
        setSelectedSector,
    ] = React.useState<string[] | undefined>(undefined);

    const [
        selectedMarker,
        setSelectedMarker,
    ] = React.useState<string[] | undefined>(undefined);

    const programListGetUrl = `${apiEndPoint}/core/program/`;
    const [
        programListPending,
        programListResponse,
    ] = useRequest<MultiResponse<Program>>(programListGetUrl);

    const sectorGetRequest = `${apiEndPoint}/core/sector/`;
    const [
        sectorListPending,
        sectorListResponse,
    ] = useRequest<MultiResponse<Sector>>(sectorGetRequest);

    const subSectorGetRequest = `${apiEndPoint}/core/sub-sector/`;
    const [
        subSectorListPending,
        subSectorListResponse,
    ] = useRequest<MultiResponse<SubSector>>(subSectorGetRequest);

    const markerGetRequest = `${apiEndPoint}/core/marker-category/`;
    const [
        markerListPending,
        markerListResponse,
    ] = useRequest<MultiResponse<Marker>>(markerGetRequest);

    const subMarkerGetRequest = `${apiEndPoint}/core/marker-value/`;
    const [
        subMarkerListPending,
        subMarkerListResponse,
    ] = useRequest<MultiResponse<SubMarker>>(subMarkerGetRequest);

    const sectorOptions: TreeItem[] | undefined = useMemo(
        () => (
            sectorListResponse?.results
                .map(({ id, name }) => ({
                    key: `sector-${id}`,
                    parentKey: undefined,
                    parentId: undefined,
                    name,
                    id,
                }))
        ),
        [sectorListResponse?.results],
    );
    const subSectorOptions: TreeItem[] | undefined = useMemo(
        () => (
            subSectorListResponse?.results.map(
                ({ id, sectorId, name }) => ({
                    key: `subsector-${id}`,
                    parentKey: `sector-${sectorId}`,
                    parentId: sectorId,
                    name,
                    id,
                }),
            )
        ),
        [subSectorListResponse?.results],
    );
    const combinedSectorOptions = useMemo(
        () => join(sectorOptions, subSectorOptions),
        [sectorOptions, subSectorOptions],
    );

    const markerOptions: TreeItem[] | undefined = useMemo(
        () => (
            markerListResponse?.results
                .map(({ id, name }) => ({
                    key: `marker-${id}`,
                    parentKey: undefined,
                    parentId: undefined,
                    name,
                    id,
                }))
        ),
        [markerListResponse?.results],
    );
    const subMarkerOptions: TreeItem[] | undefined = useMemo(
        () => (
            subMarkerListResponse?.results
                .map(({ id, markerCategoryId, value }) => ({
                    key: `submarker-${id}`,
                    parentKey: `marker-${markerCategoryId}`,
                    parentId: markerCategoryId,
                    name: value,
                    id,
                }))
        ),
        [subMarkerListResponse?.results],
    );
    const combinedMarkerOptions = useMemo(
        () => join(markerOptions, subMarkerOptions),
        [markerOptions, subMarkerOptions],
    );

    const filteredPrograms = useMemo(
        () => {
            if (!programListResponse) {
                return undefined;
            }
            const { results: programs } = programListResponse;
            if (
                (!selectedMarker || selectedMarker.length <= 0)
                && (!selectedSector || selectedSector.length <= 0)
            ) {
                return programs;
            }

            /*
            const selectedSectors = selectedSector
                ?.map((item) => {
                    const result = item.match(/^sector-(\d+)$/);
                    if (!result) {
                        return undefined;
                    }
                    return +result[1];
                })
                .filter(isDefined);

            const selectedSubSectors = selectedSector
                ?.map((item) => {
                    const result = item.match(/^subsector-(\d+)-(\d+)$/);
                    if (!result) {
                        return undefined;
                    }
                    if (selectedSectors?.includes(+result[1])) {
                        return undefined;
                    }
                    return +result[2];
                })
                .filter(isDefined);
            */

            const selectedSectors = selectedSector
                ?.filter(item => item.startsWith('sector-'))
                .map(item => +item.substring('sector-'.length));

            const selectedSubSectors = selectedSector
                ?.filter(item => item.startsWith('subsector-'))
                .map(item => +item.substring('subsector-'.length));

            const selectedMarkers = selectedMarker
                ?.filter(item => item.startsWith('marker-'))
                .map(item => +item.substring('marker-'.length));

            const selectedSubMarkers = selectedMarker
                ?.filter(item => item.startsWith('submarker-'))
                .map(item => +item.substring('submarker-'.length));

            const filtered = programs.filter((program) => {
                const isSelectedSectorsGood = (
                    !selectedSector || commonCount(selectedSectors, program.sector) > 0
                );
                const isSelectedSubSectorsGood = (
                    !selectedSector || commonCount(selectedSubSectors, program.subSector) > 0
                );
                const isSelectedMarkersGood = (
                    !selectedMarker || commonCount(selectedMarkers, program.markerCategory) > 0
                );
                const isSelectedSubMarkersGood = (
                    !selectedMarker || commonCount(selectedSubMarkers, program.markerValue) > 0
                );
                /*
                console.warn(
                    selectedMarker, program.markerCategory, selectedSubMarkers, program.markerValue,
                );
                */
                return (
                    (isSelectedSectorsGood || isSelectedSubSectorsGood)
                    && (isSelectedMarkersGood || isSelectedSubMarkersGood)
                );
            });
            return filtered;
        },
        [
            selectedMarker,
            selectedSector,
            programListResponse,
        ],
    );

    // TODO: Only selected programs belonging to filtered programs should be valid

    return (
        <div className={_cs(className, styles.programSelector)}>
            <SelectInput
                placeholder={`Select from ${filteredPrograms?.length || 0} programs`}
                className={styles.indicatorSelectInput}
                disabled={programListPending}
                options={filteredPrograms}
                onChange={setSelectedProgram}
                value={selectedProgram}
                optionLabelSelector={programLabelSelector}
                optionKeySelector={programKeySelector}
            />
            <DropdownMenu
                label={`Sectors ${selectedSector && selectedSector.length > 0 ? '*' : ''}`}
                className={styles.sectorInput}
            >
                <TreeInput
                    className={styles.sectorTree}
                    // label="Sector"
                    keySelector={treeKeySelector}
                    parentKeySelector={treeParentSelector}
                    labelSelector={treeLabelSelector}
                    options={combinedSectorOptions}
                    value={selectedSector}
                    onChange={setSelectedSector}
                    defaultCollapseLevel={0}
                />
            </DropdownMenu>
            <DropdownMenu
                label={`Markers ${selectedMarker && selectedMarker.length > 0 ? '*' : ''}`}
                className={styles.markerInput}
            >
                <TreeInput
                    className={styles.markerTree}
                    // label="Marker"
                    keySelector={treeKeySelector}
                    parentKeySelector={treeParentSelector}
                    labelSelector={treeLabelSelector}
                    options={combinedMarkerOptions}
                    value={selectedMarker}
                    onChange={setSelectedMarker}
                    defaultCollapseLevel={0}
                />
            </DropdownMenu>
        </div>
    );
}
export default ProgramSelector;
