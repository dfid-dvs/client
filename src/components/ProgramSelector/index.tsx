import React, { useMemo, useContext, useEffect } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { _cs, intersection } from '@togglecorp/fujs';

import useRequest from '#hooks/useRequest';
import { apiEndPoint } from '#utils/constants';
import {
    MultiResponse,
    Program,
    DomainContextProps,
} from '#types';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import DomainContext from '#components/DomainContext';
import MultiSelectInput from '#components/MultiSelectInput';
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

    const {
        programs: selectedProgram,
        setPrograms: setSelectedPrograms,
    } = useContext<DomainContextProps>(DomainContext);

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
    ] = useRequest<MultiResponse<Program>>(programListGetUrl, 'program-list');

    const sectorGetRequest = `${apiEndPoint}/core/sector/`;
    const [
        sectorListPending,
        sectorListResponse,
    ] = useRequest<MultiResponse<Sector>>(sectorGetRequest, 'sector-list');

    const subSectorGetRequest = `${apiEndPoint}/core/sub-sector/`;
    const [
        subSectorListPending,
        subSectorListResponse,
    ] = useRequest<MultiResponse<SubSector>>(subSectorGetRequest, 'sub-sector-list');

    const markerGetRequest = `${apiEndPoint}/core/marker-category/`;
    const [
        markerListPending,
        markerListResponse,
    ] = useRequest<MultiResponse<Marker>>(markerGetRequest, 'marker-list');

    const subMarkerGetRequest = `${apiEndPoint}/core/marker-value/`;
    const [
        subMarkerListPending,
        subMarkerListResponse,
    ] = useRequest<MultiResponse<SubMarker>>(subMarkerGetRequest, 'sub-marker-list');

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
                // FIXME: this can be optimized

                const programSectors = new Set(program.sector.map(item => item.id));
                const isSelectedSectorsGood = (
                    !selectedSectors || selectedSectors.length <= 0
                ) || (
                    selectedSectors.every(item => programSectors.has(item))
                );

                const programSubSectors = new Set(program.subSector.map(item => item.id));
                const isSelectedSubSectorsGood = (
                    !selectedSubSectors || selectedSubSectors.length <= 0
                ) || (
                    selectedSubSectors.every(item => programSubSectors.has(item))
                );

                const programMarkers = new Set(program.markerCategory.map(item => item.id));
                const isSelectedMarkersGood = (
                    !selectedMarkers || selectedMarkers.length <= 0
                ) || (
                    selectedMarkers.every(item => programMarkers.has(item))
                );

                const programSubMarkers = new Set(program.markerValue.map(item => item.id));
                const isSelectedSubMarkersGood = (
                    !selectedSubMarkers || selectedSubMarkers.length <= 0
                ) || (
                    selectedSubMarkers.every(item => programSubMarkers.has(item))
                );

                return (
                    isSelectedSectorsGood
                    && isSelectedSubSectorsGood
                    && isSelectedMarkersGood
                    && isSelectedSubMarkersGood
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


    useEffect(
        () => {
            setSelectedPrograms((programs) => {
                if (!filteredPrograms) {
                    return [];
                }
                const newSet = new Set(filteredPrograms.map(item => item.id));

                return programs.filter(item => newSet.has(item));
            });
        },
        [filteredPrograms, setSelectedPrograms],
    );

    // TODO: Only selected programs belonging to filtered programs should be valid

    return (
        <div className={_cs(className, styles.programSelector)}>
            <MultiSelectInput
                placeholder={`Select from ${filteredPrograms?.length || 0} programs`}
                className={styles.indicatorSelectInput}
                pending={programListPending}
                options={filteredPrograms}
                onChange={setSelectedPrograms}
                value={selectedProgram}
                optionLabelSelector={programLabelSelector}
                optionKeySelector={programKeySelector}
                dropdownContainerClassName={styles.programSelectDropdown}
            />
            <DropdownMenu
                className={_cs(
                    styles.sectorInput,
                    selectedSector && selectedSector.length > 0 && styles.applied,
                )}
                label={(
                    <>
                        Sectors
                        <IoMdArrowDropdown />
                    </>
                )}
            >
                {(sectorListPending || subSectorListPending) && (
                    <Backdrop>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                <TreeInput
                    className={styles.sectorTree}
                    label="Filter programs by sector"
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
                className={_cs(
                    styles.markerInput,
                    selectedMarker && selectedMarker.length > 0 && styles.applied,
                )}
                label={(
                    <>
                        Markers
                        <IoMdArrowDropdown />
                    </>
                )}
                dropdownContainerClassName={styles.markersDropdown}
            >
                {(markerListPending || subMarkerListPending) && (
                    <Backdrop>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                <TreeInput
                    className={styles.markerTree}
                    label="Filter programs by marker"
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
