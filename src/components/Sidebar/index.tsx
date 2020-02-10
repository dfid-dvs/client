import React from 'react';
import { _cs } from '@togglecorp/fujs';
import Faram, { FaramInputElement } from '@togglecorp/faram';

import RadioInput from '#rsci/RadioInput';
import MultiSelectInputWithList from '#rsci/MultiSelectInputWithList';
import Button from '#rsu/../v2/Action/Button';
import { MultiResponse } from '#constants/types';
import Tree from '#rsu/../v2/Input/TreeInput';

import Logo from '#resources/img/logo-white-01.svg';
import {
    createRequestClient,
    NewProps,
    ClientAttributes,
    methods,
} from '#request';
import styles from './styles.scss';

enum AdminLevel {
    Province,
    District,
    Municipality,
}

interface FaramValues {
    adminLevel?: AdminLevel;
    sector?: string[];
    marker?: string[];
}

interface FaramErrors {
}

interface OwnProps {
    className?: string;
}
interface State {
    // value: string[] | undefined;
    faramValues: FaramValues;
    faramErrors: FaramErrors;
}
interface Params {
}
interface Options {
    key: number;
    name: string;
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

const adminLevelsList: Options[] = [
    {
        key: AdminLevel.Province,
        name: 'Province',
    },
    {
        key: AdminLevel.District,
        name: 'District',
    },
    {
        key: AdminLevel.Municipality,
        name: 'Municipality',
    },
];

const TreeInput = FaramInputElement(Tree);

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
}

interface Municipality {
    id: number;
    provinceId: number;
    provinceName: string;
    districtId: number;
    districtName: string;
    name: string;
    gnTypeEn: string;
    gnTypeNp: string;
    population: number;
    geography: string;
    cbsCode: string;
    hlcitCode: string;
    pCode: string;
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

interface Program {
    id: number;
    name: string;
    description: string;
    sector: number[];
    subSector: number[];
    markerCategoty: number[];
    markerValue: number[];
    partner: number[];
    programCode: string;
    budget: string;
}

interface Layer {
    id: number;
    name: string;
    layerName: string;
    workspace: string;
    geoserverUrl: string;
    storeName: string;
    type: string;
    category: string;
    filename: string;
    description: string;
}

interface Indicator {
    id: number;
    indicator: string;
    fullTitle: string;
    abstract: string;
    category: string;
    source: string;
    federalLevel: 'municipality level' | 'district level' | 'province level';
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


type Props = NewProps<OwnProps, Params>
const requestOptions: { [key: string]: ClientAttributes<OwnProps, Params> } = {
    indicatorGetRequest: {
        url: '/indicator-list/',
        method: methods.GET,
        onMount: true,
    },
    provinceGetRequest: {
        url: '/province/',
        method: methods.GET,
        onMount: true,
    },
    districtGetRequest: {
        url: '/district/',
        method: methods.GET,
        onMount: true,
    },
    municipalityGetRequest: {
        url: '/gapanapa/',
        method: methods.GET,
        onMount: true,
    },
    sectorGetRequest: {
        url: '/sector/',
        method: methods.GET,
        onMount: true,
    },
    subSectorGetRequest: {
        url: '/sub-sector/',
        method: methods.GET,
        onMount: true,
    },
    programGetRequest: {
        url: '/program/',
        method: methods.GET,
        onMount: true,
    },
    layerGetRequest: {
        url: '/map-layer/',
        method: methods.GET,
        onMount: true,
    },
    markerGetRequest: {
        url: '/marker-category/',
        method: methods.GET,
        onMount: true,
    },
    subMarkerGetRequest: {
        url: '/marker-value/',
        method: methods.GET,
        onMount: true,
    },
};

const indicatorKeySelector = (d: Indicator) => d.id;
const indicatorLabelSelector = (d: Indicator) => d.fullTitle;

const provinceKeySelector = (d: Province) => d.id;
const provinceLabelSelector = (d: Province) => d.name;

const districtKeySelector = (d: District) => d.id;
const districtLabelSelector = (d: District) => d.name;

const municipalityKeySelector = (d: Municipality) => d.id;
const municipalityLabelSelector = (d: Municipality) => d.name;

const programKeySelector = (d: Program) => d.id;
const programLabelSelector = (d: Program) => d.name;

const layerKeySelector = (d: Layer) => d.id;
const layerLabelSelector = (d: Layer) => d.name;

const keySelector = (d: Options) => d.key;
const labelSelector = (d: Options) => d.name;

const backgroundLayerList: Options[] = [
    {
        key: 1,
        name: 'Population',
    },
    {
        key: 2,
        name: 'Travel times to medical facilities',
    },
];

class Sidebar extends React.PureComponent<Props, State> {
    private static schema = {
        fields: {
            adminLevel: [],
            adminArea: [],
            programList: [],
            indicatorList: [],
            layerList: [],
            backgroundLayerList: [],
        },
    };

    public constructor(props: Props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
        };
    }

    private handleChange = (faramValues: FaramValues, faramErrors: FaramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    }

    private handleValidationFailure = (faramErrors: FaramErrors) => {
        this.setState({ faramErrors });
    }

    private handleValidationSuccess = (faramValues: FaramValues) => {
        console.warn('Success', faramValues);
    }

    /*
    private setValue = (key: string[] | undefined) => {
        console.warn('selectedKey', key);
        this.setState({
            value: key,
        });
    }
    */

    public render() {
        const {
            className,
            requests: {
                // Secondary data
                indicatorGetRequest: {
                    pending: indicatorTitlePending,
                    response: indicatorResponse = {},
                },
                layerGetRequest: {
                    response: layerResponse = {},
                },
                // Location data
                provinceGetRequest: {
                    response: provinceResponse = {},
                },
                districtGetRequest: {
                    response: districtResponse = {},
                },
                municipalityGetRequest: {
                    response: municipalityResponse = {},
                },
                // Programme filters
                sectorGetRequest: {
                    response: sectorResponse = {},
                },
                subSectorGetRequest: {
                    response: subSectorResponse = {},
                },
                markerGetRequest: {
                    response: markerResponse = {},
                },
                subMarkerGetRequest: {
                    response: subMarkerResponse = {},
                },
                // Programme data
                programGetRequest: {
                    response: programResponse = {},
                },
            },
        } = this.props;

        const { results: indicatorList = [] } = indicatorResponse as MultiResponse<Indicator>;
        const { results: provinceList = [] } = provinceResponse as MultiResponse<Province>;
        const { results: districtList = [] } = districtResponse as MultiResponse<District>;
        // eslint-disable-next-line max-len
        const { results: municipalityList = [] } = municipalityResponse as MultiResponse<Municipality>;
        const { results: sectorList = [] } = sectorResponse as MultiResponse<Sector>;
        const { results: programList = [] } = programResponse as MultiResponse<Program>;
        const { results: markerList = [] } = markerResponse as MultiResponse<Marker>;
        const { results: subMarkerList = [] } = subMarkerResponse as MultiResponse<SubMarker>;
        const { results: subSectorList = [] } = subSectorResponse as MultiResponse<SubSector>;
        const { results: layerList = [] } = layerResponse as MultiResponse<Layer>;


        const markerOptions: TreeItem[] = markerList.map(({ id, name }) => ({
            key: `marker-${id}`,
            parentKey: undefined,
            parentId: undefined,
            name,
            id,
        }));
        const subMarkerOptions: TreeItem[] = subMarkerList.map(
            ({ id, markerCategoryId, value }) => ({
                key: `submarker-${markerCategoryId}-${id}`,
                parentKey: `marker-${markerCategoryId}`,
                parentId: markerCategoryId,
                name: value,
                id,
            }),
        );
        const combinedMarkerOptions = [...markerOptions, ...subMarkerOptions];

        const sectorOptions: TreeItem[] = sectorList.map(({ id, name }) => ({
            key: `sector-${id}`,
            parentKey: undefined,
            parentId: undefined,
            name,
            id,
        }));
        const subSectorOptions: TreeItem[] = subSectorList.map(
            ({ id, sectorId, name }) => ({
                key: `subsector-${sectorId}-${id}`,
                parentKey: `sector-${sectorId}`,
                parentId: sectorId,
                name,
                id,
            }),
        );
        const combinedSectorOptions = [...sectorOptions, ...subSectorOptions];

        const {
            // value,
            faramErrors,
            faramValues,
        } = this.state;

        // For Sectors

        let selectedSectors: number[] = [];
        let selectedSubSectors: number[] = [];

        const { sector } = faramValues;
        if (sector) {
            selectedSectors = sectorOptions
                .filter(option => sector.includes(option.key))
                .map(s => s.id);

            selectedSubSectors = subSectorOptions
                .filter(option => sector.includes(option.key))
                .map(s => s.id);
        }

        console.warn('selectedSectors', selectedSectors, selectedSubSectors);

        // For Markers

        let selectedMarkers: number [] = [];
        let selectedSubMarkers: number [] = [];

        const { marker } = faramValues;
        if (marker) {
            selectedMarkers = markerOptions
                .filter(option => marker.includes(option.key))
                .map(s => s.id);

            selectedSubMarkers = subMarkerOptions
                .filter(option => marker.includes(option.key))
                .map(s => s.id);
        }
        console.warn('selecte Markers', selectedMarkers, selectedSubMarkers);


        return (
            <div className={_cs(className, styles.sidebar)}>
                <div className={styles.sidebarContent}>
                    <img
                        className={styles.logo}
                        src={Logo}
                        alt="logo"
                        title="logo"
                    />
                    <Faram
                        schema={Sidebar.schema}
                        error={faramErrors}
                        value={faramValues}
                        onValidationFailure={this.handleValidationFailure}
                        onValidationSuccess={this.handleValidationSuccess}
                        onChange={this.handleChange}
                        disabled={indicatorTitlePending}
                    >
                        <div
                            className={_cs(
                                styles.adminLevels,
                                styles.dataCategory,
                            )}
                        >
                            <h3 className={styles.title}>
                                Administrative Levels
                            </h3>
                            <RadioInput
                                faramElementName="adminLevel"
                                className={styles.options}
                                options={adminLevelsList}
                                keySelector={keySelector}
                                labelSelector={labelSelector}
                            />
                            {faramValues.adminLevel === AdminLevel.Province && (
                                <MultiSelectInputWithList
                                    faramElementName="province"
                                    className={styles.selectOptions}
                                    options={provinceList}
                                    label="Province"
                                    placeholder=""
                                    keySelector={provinceKeySelector}
                                    labelSelector={provinceLabelSelector}
                                    emptyComponent={null}
                                />
                            )}
                            {faramValues.adminLevel === AdminLevel.District && (
                                <MultiSelectInputWithList
                                    faramElementName="district"
                                    className={styles.selectOptions}
                                    options={districtList}
                                    label="District"
                                    placeholder=""
                                    keySelector={districtKeySelector}
                                    labelSelector={districtLabelSelector}
                                    emptyComponent={null}
                                />
                            )}
                            {faramValues.adminLevel === AdminLevel.Municipality && (
                                <MultiSelectInputWithList
                                    faramElementName="municipality"
                                    className={styles.selectOptions}
                                    options={municipalityList}
                                    label="Municipality"
                                    placeholder=""
                                    keySelector={municipalityKeySelector}
                                    labelSelector={municipalityLabelSelector}
                                    emptyComponent={null}
                                />
                            )}
                        </div>

                        <div
                            className={_cs(
                                styles.dfidData,
                                styles.dataCategory,
                            )}
                        >
                            <h3 className={styles.title}>
                                DFID Data
                            </h3>
                            <TreeInput
                                className={styles.sectorTree}
                                label="Sector"
                                faramElementName="sector"
                                keySelector={treeKeySelector}
                                parentKeySelector={treeParentSelector}
                                labelSelector={treeLabelSelector}
                                options={combinedSectorOptions}
                                // value={value}
                                // onChange={this.setValue}
                                defaultCollapseLevel={0}
                            />
                            <TreeInput
                                className={styles.markerTree}
                                label="Marker"
                                faramElementName="marker"
                                keySelector={treeKeySelector}
                                parentKeySelector={treeParentSelector}
                                labelSelector={treeLabelSelector}
                                options={combinedMarkerOptions}
                                // value={value}
                                // onChange={this.setValue}
                                defaultCollapseLevel={0}
                            />
                            <MultiSelectInputWithList
                                label="Programs"
                                placeholder=""
                                faramElementName="programList"
                                className={styles.programSelect}
                                options={programList}
                                keySelector={programKeySelector}
                                labelSelector={programLabelSelector}
                                searchValue
                                emptyComponent={null}
                            />
                        </div>
                        <div
                            className={_cs(
                                styles.secondaryData,
                                styles.dataCategory,
                            )}
                        >
                            <h3 className={styles.title}>
                                Secondary Data
                            </h3>

                            <MultiSelectInputWithList
                                faramElementName="indicatorList"
                                className={styles.indicatorSelect}
                                options={indicatorList}
                                label="Indicators"
                                placeholder=""
                                keySelector={indicatorKeySelector}
                                labelSelector={indicatorLabelSelector}
                                emptyComponent={null}
                            />

                            <MultiSelectInputWithList
                                faramElementName="layerList"
                                className={styles.layerSelect}
                                options={layerList}
                                label="Layers"
                                placeholder=""
                                keySelector={layerKeySelector}
                                labelSelector={layerLabelSelector}
                                emptyComponent={null}
                            />

                            <MultiSelectInputWithList
                                faramElementName="backgroundLayerList"
                                className={styles.backgroundLayerSelect}
                                options={backgroundLayerList}
                                label="Background Layers"
                                placeholder=""
                                keySelector={keySelector}
                                labelSelector={labelSelector}
                                emptyComponent={null}
                            />
                        </div>
                        <div
                            className={_cs(
                                styles.buttonsSection,
                                styles.dataCategory,
                            )}
                        >
                            <Button
                                buttonType="button-danger"
                                className={styles.button}
                                onClick={() => { console.warn('cancel clicked'); }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className={styles.button}
                                type="submit"
                                buttonType="button-primary"
                                onClick={() => { console.warn('apply clicked'); }}
                            >
                                Apply
                            </Button>
                        </div>
                    </Faram>
                </div>
            </div>
        );
    }
}
export default createRequestClient(requestOptions)(Sidebar);
