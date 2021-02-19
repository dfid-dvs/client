import React, { useMemo, useContext, useEffect, useState } from 'react';
import { IoIosDocument, IoMdPeople } from 'react-icons/io';
import { FaRegBuilding, FaShapes } from 'react-icons/fa';
import { _cs } from '@togglecorp/fujs';

import useRequest from '#hooks/useRequest';
import { apiEndPoint } from '#utils/constants';
import {
    MultiResponse,
    Program,
    Partner,
    DomainContextProps,
} from '#types';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import DomainContext from '#components/DomainContext';
import SelectorItem from './SelectorItem';

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


interface TreeItem<T = string> {
    key: T;
    id: number;
    parentKey: T | undefined;
    parentId: number | undefined;
    name: string;
}

type ExpanedFilter = 'programs' | 'partners' | 'sectors' | 'markers';

interface Props {
    className?: string;
    isMinimized?: boolean;
}
function ProgramSelector(props: Props) {
    const {
        className,
        isMinimized,
    } = props;

    const {
        programs: selectedProgram,
        setPrograms: setSelectedPrograms,
    } = useContext<DomainContextProps>(DomainContext);

    const [
        selectedSector,
        setSelectedSector,
    ] = useState<string[]>([]);

    const [
        selectedMarker,
        setSelectedMarker,
    ] = useState<string[]>([]);

    const [
        selectedPartner,
        setSelectedPartner,
    ] = useState<string[]>([]);

    const [
        expandedFilters,
        setExpanedFilters,
    ] = useState<ExpanedFilter[]>(['programs']);

    const programListGetUrl = `${apiEndPoint}/core/program/`;
    const [
        programListPending,
        programListResponse,
    ] = useRequest<MultiResponse<Program>>(programListGetUrl, 'program-list');

    const partnerListGetUrl = `${apiEndPoint}/core/partner/`;
    const [
        partnerListPending,
        partnerListResponse,
    ] = useRequest<MultiResponse<Partner>>(partnerListGetUrl, 'partner-list');

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

    const [
        programSearchText,
        setProgramSearchText,
    ] = useState('');

    const [
        partnerSearchText,
        setPartnerSearchText,
    ] = useState('');

    const [
        sectorSearchText,
        setSectorSearchText,
    ] = useState('');

    const [
        markerSearchText,
        setMarkerSearchText,
    ] = useState('');

    const partnerOptions: TreeItem[] | undefined = useMemo(
        () => {
            const partnerList = programListResponse?.results
                .map(item => item.partner)
                .flat()
                .map(item => item.id);
            const partnerSet = new Set(partnerList);

            const mappedPartnerList = partnerListResponse?.results
                .map(({ id, name }) => ({
                    key: String(id),
                    parentKey: undefined,
                    parentId: undefined,
                    name,
                    id,
                }))
                // Just remove partners which are not active in any program
                .filter(item => partnerSet.has(item.id));

            if (!partnerSearchText) {
                return mappedPartnerList;
            }

            const searchText = partnerSearchText.toLowerCase();
            return mappedPartnerList?.filter(item => item.name.toLowerCase().includes(searchText));
        },
        [partnerListResponse?.results, programListResponse?.results, partnerSearchText],
    );

    const sectorOptions: TreeItem[] | undefined = useMemo(
        () => {
            const mappedSectorList = sectorListResponse?.results
                .map(({ id, name }) => ({
                    key: `sector-${id}`,
                    parentKey: undefined,
                    parentId: undefined,
                    name,
                    id,
                }));

            if (!sectorSearchText) {
                return mappedSectorList;
            }

            const searchText = sectorSearchText.toLowerCase();
            return mappedSectorList?.filter(item => item.name.toLowerCase().includes(searchText));
        },
        [sectorListResponse?.results, sectorSearchText],
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
        () => {
            const mappedMarkerList = markerListResponse?.results
                .map(({ id, name }) => ({
                    key: `marker-${id}`,
                    parentKey: undefined,
                    parentId: undefined,
                    name,
                    id,
                }));

            if (!markerSearchText) {
                return mappedMarkerList;
            }
            const searchText = markerSearchText.toLowerCase();
            return mappedMarkerList?.filter(item => item.name.toLowerCase().includes(searchText));
        },
        [markerListResponse?.results, markerSearchText],
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

    const programOptions: TreeItem<number>[] | undefined = useMemo(
        () => {
            const programList = programListResponse?.results.map(p => ({
                ...p,
                key: p.id,
                parentKey: undefined,
                parentId: undefined,
            }));

            if (!programSearchText) {
                return programList;
            }

            const searchText = programSearchText.toLowerCase();
            return programList?.filter(item => item.name.toLowerCase().includes(searchText));
        },
        [programListResponse?.results, programSearchText],
    );

    // eslint-disable-next-line max-len
    const loading = programListPending || partnerListPending || markerListPending || subMarkerListPending || sectorListPending || subSectorListPending;

    return (
        <div className={_cs(className, styles.programSelector)}>
            {loading && (
                <Backdrop>
                    <LoadingAnimation />
                </Backdrop>
            )}
            {/* FIXME : options, value, setSelectedValue type mismatch */}
            <SelectorItem
                name="programs"
                className={styles.programTree}
                options={programOptions}
                value={selectedProgram}
                setSelectedValue={setSelectedPrograms}
                expandedFilters={expandedFilters}
                setExpandedFilters={setExpanedFilters}
                isMinimized={isMinimized}
                icon={<IoIosDocument />}
                searchText={programSearchText}
                setSearchText={setProgramSearchText}
            />
            <SelectorItem
                name="partners"
                className={styles.partnerTree}
                options={partnerOptions}
                value={selectedPartner}
                setSelectedValue={setSelectedPartner}
                expandedFilters={expandedFilters}
                setExpandedFilters={setExpanedFilters}
                isMinimized={isMinimized}
                icon={<FaRegBuilding />}
                searchText={partnerSearchText}
                setSearchText={setPartnerSearchText}
            />
            <SelectorItem
                name="sectors"
                className={styles.sectorTree}
                options={combinedSectorOptions}
                value={selectedSector}
                setSelectedValue={setSelectedSector}
                expandedFilters={expandedFilters}
                setExpandedFilters={setExpanedFilters}
                isMinimized={isMinimized}
                icon={<FaShapes />}
                searchText={sectorSearchText}
                setSearchText={setSectorSearchText}
            />
            <SelectorItem
                name="markers"
                className={styles.markerTree}
                options={combinedMarkerOptions}
                value={selectedMarker}
                setSelectedValue={setSelectedMarker}
                expandedFilters={expandedFilters}
                setExpandedFilters={setExpanedFilters}
                isMinimized={isMinimized}
                collapseLevel={1}
                icon={<IoMdPeople />}
                searchText={markerSearchText}
                setSearchText={setMarkerSearchText}
            />
        </div>
    );
}
export default ProgramSelector;
