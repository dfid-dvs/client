import React, { useCallback, useState, useMemo, useContext } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import { IoMdClose } from 'react-icons/io';
import PrintButton from '#components/PrintButton';

import useRequest from '#hooks/useRequest';
import {
    Bbox,
    RegionLevelOption,
    MultiResponse,
    Program,
} from '#types';
import { apiEndPoint } from '#utils/constants';

import DomainContext from '#components/DomainContext';
import SingleRegionSelect, { Province, District, Municipality } from '#components/SingleRegionSelect';
import Button from '#components/Button';
import SelectInput from '#components/SelectInput';
import TextAreaInput from '#components/TextAreaInput';
import uiAidBEKLogo from '#resources/ukaid-bek-logo.jpg';
import useBasicToggle from '#hooks/useBasicToggle';
import ProgramStat from './ProgramStat';

import ProgramProfileMap from './Map';
import ProgramProfileCharts from './Charts';
import FederalLevelComponents from './FederalLevelComponents';

import styles from './styles.css';
import DendogramTree from '#components/DendogramTree';

interface Props {
    className?: string;
}

interface MyProvince extends Province {
    type: 'province';
}
interface MyDistrict extends District {
    type: 'district';
}
interface MyMunicipality extends Municipality {
    type: 'municipality';
}

type Region = MyProvince | MyDistrict | MyMunicipality;

interface ActiveMap {
    code: string;
    name: string;
}

interface ProgramProfileResponse {
    programName: string;
    startDate: string;
    endDate: string;
    description: string;
    totalBudget: number;
    provinceCount: number;
    districtCount: number;
    municiaplityCount: number;
    federalLevelComponents: string[];
    activemap: ActiveMap[];
}

interface PartnersTreeDendogramResponse {
    results: {
        name: string;
        children: string[];
    }[];
}

interface RegionsTreeDendogramResponse {
    results: {
        name: string;
        children: {
            name: string;
            children: string[];
        }[];
    }[];
}

const programKeySelector = (item: Program) => +item.id;
const programLabelSelector = (item: Program) => item.name;

function ProgramProfile(props: Props) {
    const { className } = props;
    const {
        regionLevel,
        setRegionLevel,
    } = useContext(DomainContext);

    const [printMode, setPrintMode] = useState(false);
    const [
        selectedRegionData,
        setSelectedRegionData,
    ] = useState<Region & { type: RegionLevelOption } | undefined>(undefined);
    const [showAddModal, setAddModalVisibility] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<number>();
    const handleSelectProgram = useCallback(
        (value?: number) => {
            setSelectedProgram(value);
        },
        [setSelectedProgram],
    );
    const programProfileUrl = useMemo(
        () => {
            if (!selectedProgram) {
                return undefined;
            }
            return `${apiEndPoint}/core/programprofile?program_id=${selectedProgram}&region=${regionLevel}`;
        },
        [selectedProgram, regionLevel],
    );

    const [
        programProfilePending,
        programProfileResponse,
    ] = useRequest<ProgramProfileResponse>(programProfileUrl, 'program-profile');

    const partnersTreeDendogramUrl = useMemo(
        () => {
            if (!selectedProgram) {
                return undefined;
            }
            return `${apiEndPoint}/core/programupperdendrogram?program_id=${selectedProgram}&region=${regionLevel}`;
        },
        [selectedProgram, regionLevel],
    );

    const [
        partnersTreeDendogramPending,
        partnersTreeDendogramResponse,
    ] = useRequest<PartnersTreeDendogramResponse>(partnersTreeDendogramUrl, 'partner-tree-dendogram');

    const partnersTreeData = useMemo(() => {
        if (!partnersTreeDendogramResponse) {
            return undefined;
        }
        const { results } = partnersTreeDendogramResponse;
        if (!results) {
            return undefined;
        }
        const mappedRes = results.map((res) => {
            const childCount = res.children.length;
            return {
                ...res,
                countChild: childCount,
            };
        });
        return mappedRes;
    }, [partnersTreeDendogramResponse]);
    const regionTreeDendogramUrl = useMemo(
        () => {
            if (!selectedProgram) {
                return undefined;
            }
            return `${apiEndPoint}/core/programlowerdendrogram?program_id=${selectedProgram}`;
        },
        [selectedProgram],
    );

    const [
        regionTreeDendogramPending,
        regionTreeDendogramResponse,
    ] = useRequest<RegionsTreeDendogramResponse>(regionTreeDendogramUrl, 'region-tree-dendogram');

    const regionsTreeData = useMemo(() => {
        if (!regionTreeDendogramResponse) {
            return undefined;
        }
        const { results } = regionTreeDendogramResponse;
        if (!results) {
            return undefined;
        }
        const mappedRes = results.map((res) => {
            const childCount = res.children.map(c => c.children).flat().length;
            return {
                ...res,
                countChild: childCount,
            };
        });
        return mappedRes;
    }, [regionTreeDendogramResponse]);

    const mapRegions: number[] | undefined = useMemo(
        () => {
            if (!programProfileResponse) {
                return undefined;
            }
            return programProfileResponse.activemap.map(m => +m.code);
        },
        [programProfileResponse],
    );

    const programListGetUrl = `${apiEndPoint}/core/program/`;
    const [
        programListPending,
        programListResponse,
    ] = useRequest<MultiResponse<Program>>(programListGetUrl, 'program-list');

    const federalLevelComponents: string[] | undefined = useMemo(
        () => programProfileResponse?.federalLevelComponents,
        [programProfileResponse?.federalLevelComponents],
    );

    const handleAddChartModalClick = useCallback(() => {
        setAddModalVisibility(true);
    }, [setAddModalVisibility]);

    const handleRegionLevelChange = useCallback((newRegionLevel) => {
        setSelectedRegionData(undefined);
        setRegionLevel(newRegionLevel);
    }, [setSelectedRegionData, setRegionLevel]);

    const currentBounds: Bbox | undefined = useMemo(() => {
        const bounds = selectedRegionData
            ?.bbox
            ?.split(',')
            .slice(0, 4)
            .map(b => +b);

        return bounds?.length === 4
            ? bounds as Bbox
            : undefined;
    }, [selectedRegionData]);

    const currentDate = new Date().toDateString();

    // eslint-disable-next-line max-len
    const dataPending = programProfilePending || partnersTreeDendogramPending || regionTreeDendogramPending;

    const [
        indicatorsHidden,
        setIndicatorsHidden,
        unsetIndicatorsHidden,
    ] = useBasicToggle();

    const [
        federLevelHidden,
        setFederalLevelComponentsHidden,
        unsetFederalLevelComponentsHidden,
    ] = useBasicToggle();

    const resetProfileShown = indicatorsHidden || federLevelHidden;

    const onResetProfile = useCallback(
        () => {
            unsetIndicatorsHidden();
            unsetFederalLevelComponentsHidden();
        },
        [unsetIndicatorsHidden, unsetFederalLevelComponentsHidden],
    );

    const [description, setDescription] = useState('');
    const handleDescriptionChange = useCallback(
        (value: string) => {
            setDescription(value);
        },
        [setDescription],
    );

    return (
        <div
            className={_cs(
                className,
                styles.infographics,
                printMode && styles.printMode,
            )}
        >
            <div className={styles.sidebar}>
                <div className={styles.heading}>
                    Program Profile
                </div>
                <SelectInput
                    label="Choose Program"
                    pending={programListPending}
                    placeholder="Program"
                    className={styles.programSelectInput}
                    disabled={programListPending}
                    options={programListResponse?.results}
                    onChange={handleSelectProgram}
                    value={selectedProgram}
                    optionLabelSelector={programLabelSelector}
                    optionKeySelector={programKeySelector}
                    showDropDownIcon
                    inputClassName={styles.selectInput}
                    labelClassName={styles.selectInputLabel}
                />
                <SingleRegionSelect
                    className={styles.regionSelector}
                    onRegionLevelChange={handleRegionLevelChange}
                    regionLevel={regionLevel}
                    region={undefined}
                    disabled={printMode}
                    segmentLabel="Region Select"
                    segmentLabelClassName={styles.segmentLabel}
                    segmentInputClassName={styles.segmentInput}
                    selectInputClassName={styles.selectInput}
                    showDropDownIcon
                    searchHidden
                />
                <Button
                    className={styles.addChartButton}
                    onClick={handleAddChartModalClick}
                    disabled={printMode}
                    variant="secondary-outline"
                >
                    Add Chart
                </Button>
                <PrintButton
                    className={styles.printModeButton}
                    printMode={printMode}
                    onPrintModeChange={setPrintMode}
                    orientation="portrait"
                />
                {resetProfileShown && (
                    <Button
                        className={styles.resetProfileButton}
                        onClick={onResetProfile}
                        disabled={printMode}
                        variant="transparent"
                    >
                        Reset Profile
                    </Button>
                )}
            </div>
            {isDefined(programProfileResponse) ? (
                <div className={styles.content}>
                    <div className={styles.infographicsContent}>
                        <div className={styles.headerRow}>
                            <div className={styles.basicInfo}>
                                <div className={styles.appBrand}>
                                    <img
                                        className={styles.logo}
                                        src={uiAidBEKLogo}
                                        alt="British Embassy Kathmandu"
                                    />
                                </div>
                                <div className={styles.date}>
                                    {currentDate}
                                </div>
                                <div className={styles.programName}>
                                    {programProfileResponse.programName}
                                </div>
                                <div className={styles.programDescription}>
                                    {programProfileResponse.description}
                                </div>
                            </div>
                        </div>
                        {!indicatorsHidden && !programProfilePending && programProfileResponse && (
                            <div className={styles.statContainer}>
                                <div className={styles.statList}>
                                    <ProgramStat
                                        value={programProfileResponse.startDate}
                                        label="Start Date"
                                        className={styles.stat}
                                        isDate
                                    />
                                    <ProgramStat
                                        value={programProfileResponse.endDate}
                                        label="End Date"
                                        className={styles.stat}
                                        isDate
                                    />
                                    <ProgramStat
                                        value={programProfileResponse.totalBudget || 0}
                                        label="Budget (£)"
                                        className={styles.stat}
                                    />
                                    <ProgramStat
                                        value={programProfileResponse.provinceCount || 0}
                                        label="Province"
                                        className={styles.stat}
                                    />
                                    <ProgramStat
                                        value={programProfileResponse.districtCount || 0}
                                        label="Districts"
                                        className={styles.stat}
                                    />
                                    <ProgramStat
                                        value={programProfileResponse.municiaplityCount || 0}
                                        label="Municipalities"
                                        className={styles.stat}
                                    />
                                </div>
                                <Button
                                    onClick={setIndicatorsHidden}
                                    title="Hide Indicators"
                                    transparent
                                    variant="icon"
                                    className={styles.button}
                                >
                                    <IoMdClose
                                        className={styles.hideIcon}
                                    />
                                </Button>
                            </div>
                        )}
                        {!dataPending && (
                            <div className={styles.description}>
                                <TextAreaInput
                                    label="Description"
                                    placeholder="Write your description..."
                                    autoFocus
                                    value={description}
                                    onChange={handleDescriptionChange}
                                    className={styles.textInput}
                                    inputClassName={styles.textAreaInput}
                                    labelClassName={styles.label}
                                />
                            </div>
                        )}
                        {!dataPending && partnersTreeData && partnersTreeData.length > 0 && (
                            <div className={styles.dendogramContainer}>
                                <div className={styles.title}>
                                    Component and implementing partners tree
                                </div>
                                {partnersTreeData.map(res => (
                                    <DendogramTree
                                        treeData={res}
                                        key={res.name}
                                        separation={{ siblings: 2, nonSiblings: 2 }}
                                    />
                                ))}
                            </div>
                        )}
                        {/* eslint-disable-next-line max-len */}
                        {!federLevelHidden && federalLevelComponents && federalLevelComponents.length > 0 && (
                            <FederalLevelComponents
                                className={styles.sectors}
                                federalLevelComponents={federalLevelComponents}
                                setFederalLevelComponentsHidden={setFederalLevelComponentsHidden}
                            />
                        )}
                        {mapRegions && (
                            <div className={styles.mapSection}>
                                <div className={styles.title}>
                                    Active map at program level
                                </div>
                                <ProgramProfileMap
                                    className={styles.mapContainer}
                                    bounds={currentBounds}
                                    mapRegions={mapRegions}
                                />
                            </div>
                        )}
                        {!dataPending && regionsTreeData && regionsTreeData.length > 0 && (
                            <div className={styles.dendogramContainer}>
                                <div className={styles.title}>
                                    Component and regions tree
                                </div>
                                {regionsTreeData.map(res => (
                                    <DendogramTree
                                        treeData={res}
                                        key={res.name}
                                        separation={{ siblings: 3, nonSiblings: 3 }}
                                    />
                                ))}
                            </div>
                        )}
                        {regionLevel !== 'municipality' && (
                            <ProgramProfileCharts
                                className={styles.charts}
                                printMode={printMode}
                                showAddModal={showAddModal}
                                selectedRegion={undefined}
                                onAddModalVisibilityChange={setAddModalVisibility}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className={styles.noContent}>
                    Select a Program
                </div>
            )}
        </div>
    );
}
export default ProgramProfile;