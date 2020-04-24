import React, { useMemo } from 'react';
import { _cs, isFalsy } from '@togglecorp/fujs';

import useRequest from '#hooks/useRequest';
import { apiEndPoint } from '#utils/constants';
import { MultiResponse } from '#types';

import SelectInput from '#components/SelectInput';
import DropdownMenu from '#components/DropdownMenu';
import TreeInput from '#components/TreeInput';

import styles from './styles.css';

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
    ] = React.useState<string[]>([]);

    const [
        selectedMarker,
        setSelectedMarker,
    ] = React.useState<string[]>([]);

    const programListGetUrl = `${apiEndPoint}/program/`;
    const [
        programListPending,
        programListResponse,
    ] = useRequest<MultiResponse<Program>>(programListGetUrl);

    const sectorGetRequest = `${apiEndPoint}/sector/`;
    const [
        sectorListPending,
        sectorListResponse,
    ] = useRequest<MultiResponse<Sector>>(sectorGetRequest);

    const subSectorGetRequest = `${apiEndPoint}/sub-sector/`;
    const [
        subSectorListPending,
        subSectorListResponse,
    ] = useRequest<MultiResponse<SubSector>>(subSectorGetRequest);

    const markerGetRequest = `${apiEndPoint}/marker-category/`;
    const [
        markerListPending,
        markerListResponse,
    ] = useRequest<MultiResponse<Marker>>(markerGetRequest);

    const subMarkerGetRequest = `${apiEndPoint}/marker-value/`;
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
                    key: `subsector-${sectorId}-${id}`,
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
                    key: `submarker-${markerCategoryId}-${id}`,
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

    const filterPrograms: Program[] | undefined = useMemo(
        () => {
            if (!programListResponse || !programListResponse.results) {
                return undefined;
            }
            if (selectedSector.length === 0 && selectedMarker.length === 0) {
                return programListResponse?.results;
            }

            const { results: programs } = programListResponse;

            const sectorKeys = sectorOptions
                ?.filter(sector => selectedSector?.includes(sector.key))
                .map(sector => sector.id);

            const subSectorKeys = subSectorOptions
                ?.filter(subSector => selectedSector?.includes(subSector.key))
                .map(subSector => subSector.id);

            const filteredProgramsBySector = programs.filter(program => (
                program.sector.some(sector => sectorKeys?.includes(sector))
            ));

            const filteredProgramsBySubSector = programs.filter(program => (
                program.subSector.some(subSector => subSectorKeys?.includes(subSector))
            ));

            const markerKeys = markerOptions
                ?.filter(marker => selectedMarker?.includes(marker.key))
                .map(marker => marker.id);

            const subMarkerKeys = subMarkerOptions
                ?.filter(subMarker => selectedMarker?.includes(subMarker.key))
                .map(subMarker => subMarker.id);

            const filteredProgramsByMarker = programs.filter(program => (
                program.markerCategory.some(marker => markerKeys?.includes(marker))
            ));

            const filteredProgramsBySubMarker = programs.filter(program => (
                program.markerValue.some(subMarker => subMarkerKeys?.includes(subMarker))
            ));

            return [
                ...filteredProgramsBySector,
                ...filteredProgramsBySubSector,
                ...filteredProgramsByMarker,
                ...filteredProgramsBySubMarker,
            ];
        },
        [
            selectedMarker,
            selectedSector,
            sectorOptions,
            subSectorOptions,
            markerOptions,
            subMarkerOptions,
            programListResponse,

        ],
    );

    return (
        <div className={_cs(className, styles.programSelector)}>
            <SelectInput
                placeholder="Select a programme"
                className={styles.indicatorSelectInput}
                disabled={programListPending}
                options={filterPrograms}
                onChange={setSelectedProgram}
                value={selectedProgram}
                optionLabelSelector={programLabelSelector}
                optionKeySelector={programKeySelector}
            />
            <DropdownMenu label="Sectors">
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
            <DropdownMenu label="Markers">
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
