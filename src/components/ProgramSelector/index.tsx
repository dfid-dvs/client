import React, { useMemo, useState } from 'react';
import { IoIosDocument, IoMdPeople } from 'react-icons/io';
import { FaRegBuilding, FaShapes } from 'react-icons/fa';
import { _cs, isDefined, intersection, unique } from '@togglecorp/fujs';

import useRequest from '#hooks/useRequest';
import { apiEndPoint } from '#utils/constants';
import {
    MultiResponse,
    Program,
    Partner,
    // DomainContextProps,
} from '#types';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
// import DomainContext from '#components/DomainContext';
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

    const [selectedMarker, setSelectedMarker] = useState<string[]>([]);
    const [selectedProgram, setSelectedPrograms] = useState<string[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<string[]>([]);
    const [selectedSector, setSelectedSector] = useState<string[]>([]);

    console.log(
        selectedMarker,
        selectedProgram,
        selectedPartner,
        selectedSector,
    );

    /*
    const {
        markers: selectedMarker,
        setMarkers: setSelectedMarker,
        programs: selectedProgram,
        setPrograms: setSelectedPrograms,
        partners: selectedPartner,
        setPartners: setSelectedPartner,
        sectors: selectedSector,
        setSectors: setSelectedSector,
    } = useContext<DomainContextProps>(DomainContext);
     */

    const [
        expandedFilters,
        setExpanedFilters,
    ] = useState<ExpanedFilter[]>(['markers', 'programs', 'partners', 'sectors']);

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

    const rawPartnerOptions = partnerListResponse?.results;
    const rawSectorOptions = sectorListResponse?.results;
    const rawSubSectorOptions = subSectorListResponse?.results;
    const rawMarkerOptions = markerListResponse?.results;
    const rawSubMarkerOptions = subMarkerListResponse?.results;
    const rawProgramOptions = programListResponse?.results;

    const selectedSectorOriginal = unique(
        selectedSector.filter(item => item.startsWith('sector')).map(item => Number(item.split('-')[1])),
    );
    const selectedSubSectorOriginal = unique(
        selectedSector.filter(item => item.startsWith('subsector')).map(item => Number(item.split('-')[1])),
    );
    const selectedMarkerOriginal = unique(
        selectedMarker.filter(item => item.startsWith('marker')).map(item => Number(item.split('-')[1])),
    );
    const selectedSubMarkerOriginal = unique(
        selectedMarker.filter(item => item.startsWith('submarker')).map(item => Number(item.split('-')[1])),
    );
    const selectedPartnerOriginal = selectedPartner.map(Number);

    const selectedProgramOriginal = unique(
        selectedProgram.filter(item => item.startsWith('program')).map(item => Number(item.split('-')[1])),
    );

    const applicableProgramOptions = rawProgramOptions?.filter((item) => {
        if (selectedSectorOriginal.length > 0) {
            const common = intersection(
                new Set(item.sector.map(sec => sec.id)),
                new Set(selectedSectorOriginal),
            );
            if (common.size !== selectedSectorOriginal.length) {
                return false;
            }
        }
        if (selectedSubSectorOriginal.length > 0) {
            const common = intersection(
                new Set(item.subSector.map(sec => sec.id)),
                new Set(selectedSubSectorOriginal),
            );
            if (common.size !== selectedSubSectorOriginal.length) {
                return false;
            }
        }
        if (selectedMarkerOriginal.length > 0) {
            const common = intersection(
                new Set(item.markerCategory.map(sec => sec.id)),
                new Set(selectedMarkerOriginal),
            );
            if (common.size !== selectedMarkerOriginal.length) {
                return false;
            }
        }
        if (selectedSubMarkerOriginal.length > 0) {
            const common = intersection(
                new Set(item.markerValue.map(sec => sec.id)),
                new Set(selectedSubMarkerOriginal),
            );
            if (common.size !== selectedSubMarkerOriginal.length) {
                return false;
            }
        }
        if (selectedPartnerOriginal.length > 0) {
            const common = intersection(
                new Set(item.partner.map(sec => sec.id)),
                new Set(selectedPartnerOriginal),
            );
            if (common.size !== selectedPartnerOriginal.length) {
                return false;
            }
        }
        return true;
    });

    const appliedProgramOptions = applicableProgramOptions?.filter((item) => {
        if (selectedProgramOriginal.length > 0) {
            const selections = new Set(selectedProgramOriginal);
            return selections.has(item.id);
        }
        // TODO: when component is selected, treat it as program is selected.
        return true;
    });

    const partnerOptions: TreeItem[] | undefined = useMemo(
        () => {
            const partnerSet = new Set(
                appliedProgramOptions
                    ?.map(item => item.partner)
                    .flat()
                    .map(item => item?.id),
            );

            const mappedPartnerList = rawPartnerOptions
                ?.map(({ id, name }) => ({
                    key: String(id),
                    parentKey: undefined,
                    parentId: undefined,
                    name,
                    id,
                }))
                .filter(item => partnerSet.has(item.id));

            if (!partnerSearchText) {
                return mappedPartnerList;
            }

            const searchText = partnerSearchText.toLowerCase();
            return mappedPartnerList?.filter(item => item.name.toLowerCase().includes(searchText));
        },
        [rawPartnerOptions, appliedProgramOptions, partnerSearchText],
    );

    const sectorOptions: TreeItem[] | undefined = useMemo(
        () => {
            const sectorSet = new Set(
                appliedProgramOptions
                    ?.map(item => item.sector)
                    .flat()
                    .map(item => item?.id),
            );

            const mappedSectorList = rawSectorOptions
                ?.map(({ id, name }) => ({
                    key: `sector-${id}`,
                    parentKey: undefined,
                    parentId: undefined,
                    name,
                    id,
                }))
                .filter(item => sectorSet.has(item.id));

            if (!sectorSearchText) {
                return mappedSectorList;
            }

            const searchText = sectorSearchText.toLowerCase();
            return mappedSectorList?.filter(item => item.name.toLowerCase().includes(searchText));
        },
        [rawSectorOptions, sectorSearchText, appliedProgramOptions],
    );
    const subSectorOptions: TreeItem[] | undefined = useMemo(
        () => {
            const subSectorSet = new Set(
                appliedProgramOptions
                    ?.map(item => item.subSector)
                    .flat()
                    .map(item => item?.id),
            );

            return rawSubSectorOptions?.map(
                ({ id, sectorId, name }) => ({
                    key: `subsector-${id}`,
                    parentKey: `sector-${sectorId}`,
                    parentId: sectorId,
                    name,
                    id,
                }),
            ).filter(item => subSectorSet.has(item.id));
        },
        [rawSubSectorOptions, appliedProgramOptions],
    );
    const combinedSectorOptions = useMemo(
        () => join(sectorOptions, subSectorOptions),
        [sectorOptions, subSectorOptions],
    );

    const markerOptions: TreeItem[] | undefined = useMemo(
        () => {
            const markerSet = new Set(
                appliedProgramOptions
                    ?.map(item => item.markerCategory)
                    .flat()
                    .map(item => item?.id),
            );
            const mappedMarkerList = rawMarkerOptions
                ?.map(({ id, name }) => ({
                    key: `marker-${id}`,
                    parentKey: undefined,
                    parentId: undefined,
                    name,
                    id,
                }))
                .filter(item => markerSet.has(item.id));

            if (!markerSearchText) {
                return mappedMarkerList;
            }
            const searchText = markerSearchText.toLowerCase();
            return mappedMarkerList?.filter(item => item.name.toLowerCase().includes(searchText));
        },
        [rawMarkerOptions, markerSearchText, appliedProgramOptions],
    );
    const subMarkerOptions: TreeItem[] | undefined = useMemo(
        () => {
            const subMarkerSet = new Set(
                appliedProgramOptions
                    ?.map(item => item.markerValue)
                    .flat()
                    .map(item => item?.id),
            );
            return rawSubMarkerOptions
                ?.map(({ id, markerCategoryId, value }) => ({
                    key: `submarker-${id}`,
                    parentKey: `marker-${markerCategoryId}`,
                    parentId: markerCategoryId,
                    name: value,
                    id,
                }))
                .filter(item => subMarkerSet.has(item.id));
        },
        [rawSubMarkerOptions, appliedProgramOptions],
    );
    const combinedMarkerOptions = useMemo(
        () => join(markerOptions, subMarkerOptions),
        [markerOptions, subMarkerOptions],
    );

    const programOptions: TreeItem<string>[] | undefined = useMemo(
        () => {
            const programList = applicableProgramOptions?.map(p => ({
                key: `program-${p.id}`,
                parentKey: undefined,
                parentId: undefined,
                name: p.name,
                id: p.id,
            }));

            if (!programSearchText) {
                return programList;
            }

            const searchText = programSearchText.toLowerCase();
            return programList?.filter(item => item.name.toLowerCase().includes(searchText));
        },
        [applicableProgramOptions, programSearchText],
    );
    const subProgramOptions: TreeItem[] | undefined = useMemo(
        () => {
            const programList = applicableProgramOptions?.map(p => (
                p.component.map((item => ({
                    key: `subprogram-${item.id}`,
                    parentKey: `program-${p.id}`,
                    parentId: p.id,
                    name: item.name,
                    id: item.id,
                })))
            )).flat().filter(isDefined);
            return programList;
        },
        [applicableProgramOptions],
    );
    const combinedProgramOptions = useMemo(
        () => join(programOptions, subProgramOptions),
        [programOptions, subProgramOptions],
    );


    // eslint-disable-next-line max-len
    const loading = (
        programListPending
        || partnerListPending
        || markerListPending
        || subMarkerListPending
        || sectorListPending
        || subSectorListPending
    );

    // TODO: disable instead of hide

    return (
        <div className={_cs(className, styles.programSelector)}>
            {loading && (
                <Backdrop>
                    <LoadingAnimation />
                </Backdrop>
            )}
            <SelectorItem
                name="markers"
                className={styles.markerTree}
                options={combinedMarkerOptions}
                value={selectedMarker}
                setSelectedValue={setSelectedMarker}
                expandedFilters={expandedFilters}
                setExpandedFilters={setExpanedFilters}
                isMinimized={isMinimized}
                // collapseLevel={1}
                icon={<IoMdPeople />}
                searchText={markerSearchText}
                setSearchText={setMarkerSearchText}
            />
            <SelectorItem
                name="programs"
                className={styles.programTree}
                options={combinedProgramOptions}
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
        </div>
    );
}
export default ProgramSelector;
