import React, { useMemo, useState, useContext, useCallback } from 'react';
import { _cs, isDefined, intersection, unique, caseInsensitiveSubmatch } from '@togglecorp/fujs';
import { MdAssignment, MdBusiness, MdPeople, MdRefresh } from 'react-icons/md';
import { FaShapes } from 'react-icons/fa';

import useRequest from '#hooks/useRequest';
import { apiEndPoint } from '#utils/constants';
import {
    MultiResponse,
    Program,
    Partner,
    DomainContextProps,
} from '#types';
import { prepareUrlParams as p } from '#utils/common';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import DomainContext from '#components/DomainContext';
import SelectorItem from './SelectorItem';

import styles from './styles.css';
import Button from '#components/Button';

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
    id: number | string;
    parentKey: T | undefined;
    parentId: number | undefined;
    name: string;
}

interface ProgramComponent {
    id: number;
    name: string;
    sector: number[];
    subSector: number[];
    code: string;
    partners: number[];
}

type ExpanedFilter = 'programs' | 'partners' | 'sectors' | 'markers';

interface Props {
    className?: string;
    isMinimized?: boolean;
    startDate?: string;
    endDate?: string;
    dataExplored?: boolean;
}
function ProgramSelector(props: Props) {
    const {
        className,
        isMinimized,
        startDate,
        endDate,
        dataExplored,
    } = props;
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

    const [
        expandedFilters,
        setExpanedFilters,
    ] = useState<ExpanedFilter[]>(['markers', 'programs', 'partners', 'sectors']);

    const programUrlParams = p({
        // eslint-disable-next-line camelcase
        start_date: dataExplored ? undefined : startDate,
        // eslint-disable-next-line camelcase
        end_date: dataExplored ? undefined : endDate,
    });

    const programListGetUrl = programUrlParams
        ? `${apiEndPoint}/core/program/?${programUrlParams}`
        : `${apiEndPoint}/core/program/`;

    const [
        programListPending,
        programListResponse,
    ] = useRequest<MultiResponse<Program>>(programListGetUrl, 'program-list');

    const componentListGetUrl = `${apiEndPoint}/core/component/`;
    const [
        componentListPending,
        componentListResponse,
    ] = useRequest<MultiResponse<ProgramComponent>>(componentListGetUrl, 'component-list');

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

    const selectedComponentOriginal = unique(
        selectedProgram.filter(item => item.startsWith('subprogram')).map(item => item.replace('subprogram-', '')),
    );
    const rawPartnerOptions = partnerListResponse?.results;
    const rawSectorOptions = sectorListResponse?.results;
    const rawSubSectorOptions = subSectorListResponse?.results;
    const rawMarkerOptions = markerListResponse?.results;
    const rawSubMarkerOptions = subMarkerListResponse?.results;
    const rawProgramOptionsWithoutComponentSectors = programListResponse?.results;
    const rawComponentOptions = componentListResponse?.results;
    const rawProgramOptions = useMemo(() => {
        if (!rawComponentOptions) {
            return undefined;
        }
        if (!rawProgramOptionsWithoutComponentSectors) {
            return undefined;
        }
        const programs = rawProgramOptionsWithoutComponentSectors.map((prog) => {
            const progCompIds = prog.component.map(pc => pc.id);
            const comp = rawComponentOptions.filter(rc => progCompIds.includes(rc.id));
            return {
                ...prog,
                component: comp,
            };
        });
        return programs;
    }, [rawComponentOptions, rawProgramOptionsWithoutComponentSectors]);

    const applicableProgramOptions = rawProgramOptions?.filter((item) => {
        if (selectedComponentOriginal.length > 0) {
            const common = intersection(
                new Set(item.component.map(comp => comp.code)),
                new Set(selectedComponentOriginal),
            );
            if (common.size !== selectedComponentOriginal.length) {
                return false;
            }
        }

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
            let partnerSet = new Set<number>();
            if (selectedComponentOriginal.length > 0) {
                const componentPartners = rawComponentOptions?.filter(
                    rc => selectedComponentOriginal.includes(rc.code),
                ).map(c => c.partners).flat();
                partnerSet = new Set(componentPartners);
            } else {
                partnerSet = new Set(
                    appliedProgramOptions
                        ?.map(item => item.partner)
                        .flat()
                        .map(item => item?.id),
                );
            }

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

            return mappedPartnerList?.filter(
                item => caseInsensitiveSubmatch(item.name, partnerSearchText),
            );
        },
        [
            rawPartnerOptions,
            appliedProgramOptions,
            partnerSearchText,
            rawComponentOptions,
            selectedComponentOriginal,
        ],
    );

    const sectorOptions: TreeItem[] | undefined = useMemo(
        () => {
            if (selectedComponentOriginal.length > 0) {
                if (!appliedProgramOptions) {
                    return undefined;
                }
                const componentAssociatedProgram = appliedProgramOptions[0];
                if (!componentAssociatedProgram) {
                    return undefined;
                }
                const { component } = componentAssociatedProgram;
                const selectedComponents = component.filter(
                    c => selectedComponentOriginal.includes(c.code),
                );

                const componentSectorIds = selectedComponents.map(comp => comp.sector).flat();
                const componentSectors = rawSectorOptions?.filter(
                    rso => componentSectorIds.includes(rso.id),
                );
                if (!componentSectors) {
                    return undefined;
                }
                const associatedComponentSectors = componentSectors.map(({ id, name }) => ({
                    key: `sector-${id}`,
                    parentKey: undefined,
                    parentId: undefined,
                    name,
                    id,
                }));
                const searchedSectors = associatedComponentSectors?.filter(
                    item => caseInsensitiveSubmatch(item.name, sectorSearchText),
                );
                return searchedSectors;
            }

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
            const searchedSectors = mappedSectorList?.filter(
                item => caseInsensitiveSubmatch(item.name, sectorSearchText),
            );
            return searchedSectors;
        },
        [
            rawSectorOptions,
            sectorSearchText,
            appliedProgramOptions,
            selectedComponentOriginal,
        ],
    );
    const subSectorOptions: TreeItem[] | undefined = useMemo(
        () => {
            if (selectedComponentOriginal.length > 0) {
                if (!appliedProgramOptions) {
                    return undefined;
                }
                const componentAssociatedProgram = appliedProgramOptions[0];
                if (!componentAssociatedProgram) {
                    return undefined;
                }
                const { component } = componentAssociatedProgram;
                const selectedComponents = component.filter(
                    c => selectedComponentOriginal.includes(c.code),
                );

                const componentSubSectorIds = selectedComponents.map(comp => comp.subSector).flat();
                const componentSubSectors = rawSubSectorOptions?.filter(
                    rso => componentSubSectorIds.includes(rso.id),
                );
                if (!componentSubSectors) {
                    return undefined;
                }
                const associatedComponentSubSectors = componentSubSectors.map(
                    ({ id, sectorId, name }) => ({
                        key: `subsector-${id}`,
                        parentKey: `sector-${sectorId}`,
                        parentId: undefined,
                        name,
                        id,
                    }),
                );
                return associatedComponentSubSectors;
            }

            const textFilteredSectors = rawSectorOptions?.filter(
                r => caseInsensitiveSubmatch(r.name, sectorSearchText),
            ).filter(isDefined);

            if (!textFilteredSectors) {
                return undefined;
            }

            if (textFilteredSectors.length <= 0) {
                return undefined;
            }

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
        [
            rawSubSectorOptions,
            appliedProgramOptions,
            sectorSearchText,
            selectedComponentOriginal,
            rawSectorOptions,
        ],
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
            return mappedMarkerList?.filter(
                item => caseInsensitiveSubmatch(item.name, markerSearchText),
            );
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
                .filter(item => subMarkerSet.has(item.id))
                .filter(item => caseInsensitiveSubmatch(item.name, markerSearchText));
        },
        [rawSubMarkerOptions, appliedProgramOptions, markerSearchText],
    );
    const combinedMarkerOptions = useMemo(
        () => join(markerOptions, subMarkerOptions),
        [markerOptions, subMarkerOptions],
    );

    const programOptions: TreeItem<string>[] | undefined = useMemo(
        () => {
            const programList = applicableProgramOptions?.map(program => ({
                key: `program-${program.id}`,
                parentKey: undefined,
                parentId: undefined,
                name: program.name,
                id: program.id,
            }));

            if (!programSearchText) {
                return programList;
            }

            return programList?.filter(
                item => caseInsensitiveSubmatch(item.name, programSearchText),
            );
        },
        [
            applicableProgramOptions,
            programSearchText,
        ],
    );
    const subProgramOptions: TreeItem[] | undefined = useMemo(
        () => {
            if (!applicableProgramOptions) {
                return undefined;
            }
            const textFilteredPrograms = applicableProgramOptions?.filter(
                item => caseInsensitiveSubmatch(item.name, programSearchText),
            );
            if (selectedSectorOriginal.length <= 0 && selectedSubSectorOriginal.length <= 0 && selectedPartnerOriginal.length <= 0) {
                const programList = textFilteredPrograms?.map(program => (
                    program.component.map((item => ({
                        key: `subprogram-${item.code}`,
                        parentKey: `program-${program.id}`,
                        parentId: program.id,
                        name: item.name,
                        id: item.id,
                    })))))
                    .flat()
                    .filter(isDefined);
                return programList;
            }

            const combinedProgramListWithComponents = textFilteredPrograms.map((prog) => {
                const compWithSectors = prog.component.map((comp) => {
                    const commonSectIds = Array.from(intersection(
                        new Set(comp.sector),
                        new Set(selectedSectorOriginal),
                    ));
                    if (commonSectIds.length > 0) {
                        return comp;
                    }
                    return undefined;
                }).filter(isDefined);

                const compWithSubSectors = prog.component.map((comp) => {
                    const commonSubSectIds = Array.from(intersection(
                        new Set(comp.subSector),
                        new Set(selectedSubSectorOriginal),
                    ));
                    if (commonSubSectIds.length > 0) {
                        return comp;
                    }
                    return undefined;
                }).filter(isDefined);

                const selectedSubSectors = prog.component.filter(
                    c => selectedComponentOriginal.includes(c.code),
                );
                const combinedComps = unique(
                    [...compWithSectors, ...compWithSubSectors, ...selectedSubSectors],
                    comp => comp.code,
                );

                if (selectedPartnerOriginal.length <= 0) {
                    return {
                        ...prog,
                        component: combinedComps,
                    };
                }
                const compWithPartners = prog.component.map((comp) => {
                    const commonPartnerIds = Array.from(intersection(
                        new Set(comp.partners),
                        new Set(selectedPartnerOriginal),
                    ));
                    if (commonPartnerIds.length > 0) {
                        return comp;
                    }
                    return undefined;
                }).filter(isDefined);
                const selectedPartners = prog.component.filter(
                    c => selectedPartnerOriginal.includes(c.id),
                );
                const combinedPartnerComps = unique(
                    [...compWithPartners, ...selectedPartners],
                    comp => comp.code,
                );
                return {
                    ...prog,
                    component: combinedPartnerComps,
                }
            });

// Data for Development Programme - Phase 2
// Support for Managing Fiscal Federalism in Nepal
// Evidence for Development - Assessing Government Data Flows in Nepal

            return combinedProgramListWithComponents.map(program => (
                program.component.map((item => ({
                    key: `subprogram-${item.code}`,
                    parentKey: `program-${program.id}`,
                    parentId: program.id,
                    name: item.name,
                    id: item.id,
                })))
            )).flat().filter(isDefined);
        },
        [
            applicableProgramOptions,
            programSearchText,
            selectedSectorOriginal,
            selectedSubSectorOriginal,
            selectedComponentOriginal,
            selectedPartnerOriginal,
        ],
    );

    const combinedProgramOptions = useMemo(
        () => join(programOptions, subProgramOptions),
        [programOptions, subProgramOptions],
    );

    // eslint-disable-next-line max-len
    const loading = (
        programListPending
        || componentListPending
        || partnerListPending
        || markerListPending
        || subMarkerListPending
        || sectorListPending
        || subSectorListPending
    );

    const clearButtonHidden = useMemo(
        () => {
            const selectedItems = [
                ...selectedProgram,
                ...selectedPartner,
                ...selectedSector,
                ...selectedMarker,
            ];
            return selectedItems.length <= 0;
        },
        [
            selectedProgram,
            selectedPartner,
            selectedSector,
            selectedMarker,
        ],
    );

    const handleClearFilters = useCallback(() => {
        setSelectedMarker([]);
        setSelectedPrograms([]);
        setSelectedPartner([]);
        setSelectedSector([]);
    }, [
        setSelectedMarker,
        setSelectedPrograms,
        setSelectedPartner,
        setSelectedSector,
    ]);
    // TODO: disable instead of hide
    return (
        <div className={_cs(className, styles.programSelector)}>
            {loading && (
                <Backdrop>
                    <LoadingAnimation />
                </Backdrop>
            )}
            <div className={styles.selectorContainer}>
                <SelectorItem
                    name="programs"
                    className={styles.program}
                    options={combinedProgramOptions}
                    value={selectedProgram}
                    setSelectedValue={setSelectedPrograms}
                    expandedFilters={expandedFilters}
                    setExpandedFilters={setExpanedFilters}
                    isMinimized={isMinimized}
                    icon={<MdAssignment />}
                    searchText={programSearchText}
                    setSearchText={setProgramSearchText}
                />
                <SelectorItem
                    name="partners"
                    className={styles.partner}
                    options={partnerOptions}
                    value={selectedPartner}
                    setSelectedValue={setSelectedPartner}
                    expandedFilters={expandedFilters}
                    setExpandedFilters={setExpanedFilters}
                    isMinimized={isMinimized}
                    icon={<MdBusiness />}
                    searchText={partnerSearchText}
                    setSearchText={setPartnerSearchText}
                />
                <SelectorItem
                    name="sectors"
                    className={styles.sector}
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
                    className={styles.marker}
                    options={combinedMarkerOptions}
                    value={selectedMarker}
                    setSelectedValue={setSelectedMarker}
                    expandedFilters={expandedFilters}
                    setExpandedFilters={setExpanedFilters}
                    isMinimized={isMinimized}
                    // collapseLevel={1}
                    icon={<MdPeople />}
                    searchText={markerSearchText}
                    setSearchText={setMarkerSearchText}
                />
            </div>
            {!clearButtonHidden && (
                <div className={styles.actions}>
                    {isMinimized ? (
                        <Button
                            className={styles.clearButton}
                            onClick={handleClearFilters}
                            variant="secondary-outline"
                            icons={<MdRefresh />}
                            title="Clear All"
                        />
                    ) : (
                        <Button
                            className={styles.clearButton}
                            onClick={handleClearFilters}
                            variant="secondary-outline"
                            icons={<MdRefresh />}
                        >
                            Clear All
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
export default ProgramSelector;
