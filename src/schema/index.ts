import Dict, { basicTypes, Schema } from '@togglecorp/ravl';
import { isProduction } from '#config/env';

/* eslint-disable @typescript-eslint/camelcase */

const userDefinedSchemas: Schema[] = [
    {
        name: 'base-entity',
        fields: {
            id: { type: 'number', required: true },
            name: { type: 'string', required: true },
        },
    },
    {
        name: 'base-entity-with-code',
        fields: {
            id: { type: 'number', required: true },
            name: { type: 'string', required: true },
            code: { type: 'string', required: true },
        },
    },
    {
        name: 'sankey-data',
        fields: {
            minThreshold: { type: 'number' },
            nodes: {
                arrayType: {
                    name: 'sankey-data-node',
                    fields: {
                        name: { type: 'string', required: true },
                        type: { type: 'string', required: true },
                    },
                },
                required: true,
            },
            links: {
                arrayType: {
                    name: 'sankey-data-link',
                    fields: {
                        source: { type: 'uint', required: true },
                        target: { type: 'uint', required: true },
                        value: { type: 'number', required: true },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'fivew-summary',
        fields: {
            allocatedBudget: { type: 'number', required: true },
            program: { type: 'uint', required: true },
            partner: { type: 'uint', required: true },
            component: { type: 'uint', required: true },
            sector: { type: 'uint', required: true },
            totalAllocatedBudget: { type: 'number', required: true },
            totalProgram: { type: 'uint', required: true },
            totalPartner: { type: 'uint', required: true },
            totalComponent: { type: 'uint', required: true },
            totalSector: { type: 'uint', required: true },
        },
    },
    {
        name: 'age-group-item',
        fields: {
            provinceId: { type: 'uint' },
            districtId: { type: 'uint' },
            munid: { type: 'uint' },

            district: { type: 'uint' },
            hlcit_code: { type: 'string' },
            municipality: { type: 'unknown' },
            pcode: { type: 'string' },

            id: { type: 'uint', required: true },
            l0_14: { type: 'uint', required: true },
            l15_49: { type: 'uint', required: true },
            l50plus: { type: 'uint', required: true },
            ltotal: { type: 'uint', required: true },
        },
    },
    {
        name: 'summary-nepal',
        description: 'Get summary for nepal',
        fields: {
            count: { type: 'number', required: true },
            next: { type: 'unknown' },
            previous: { type: 'unknown' },
            results: {
                arrayType: {
                    name: 'summary-nepal-item',
                    fields: {
                        id: { type: 'uint', required: true },
                        name: { type: 'string', required: true },
                        value: { type: 'number', required: true },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'map-layer-list',
        description: 'Get metadata on map layersj',
        fields: {
            count: { type: 'number', required: true },
            next: { type: 'unknown' },
            previous: { type: 'unknown' },
            results: {
                arrayType: {
                    name: 'map-layer-list-item',
                    fields: {
                        id: { type: 'uint', required: true },
                        name: { type: 'string', required: true },
                        layerName: { type: 'string', required: true },
                        workspace: { type: 'string', required: true },
                        storeName: { type: 'string' },
                        filename: { type: 'string' },
                        description: { type: 'string' },
                        geoserverUrl: { type: 'string', required: true }, // url
                        type: { type: 'string', required: true }, // enum: raster, vector

                        geoType: { type: 'string' }, // enum: point, polygon
                        identifierKey: { type: 'string' },

                        style: {
                            arrayType: {
                                name: 'map-layer-list-item-style',
                                fields: {
                                    id: { type: 'uint', required: true },
                                    layer: { type: 'uint', required: true },

                                    circleColor: { type: 'string' },
                                    circleRadius: { type: 'uint' },
                                    fillColor: { type: 'string' },
                                },
                            },
                            required: true,
                        },
                        popupInfo: {
                            arrayType: {
                                name: 'map-layer-list-item-popup-info',
                                fields: {
                                    id: { type: 'uint', required: true },
                                    layer: { type: 'uint', required: true },

                                    key: { type: 'string', required: true },
                                    title: { type: 'string', required: true },
                                    type: { type: 'string', required: true }, // enum: string | number
                                },
                            },
                            required: true,
                        },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'marker-list',
        description: 'Get markers',
        fields: {
            count: { type: 'number', required: true },
            next: { type: 'unknown' },
            previous: { type: 'unknown' },
            results: {
                arrayType: {
                    name: 'marker',
                    fields: {
                        id: { type: 'uint', required: true },
                        name: { type: 'string', required: true },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'sub-marker-list',
        description: 'Get sub-markers',
        fields: {
            count: { type: 'number', required: true },
            next: { type: 'unknown' },
            previous: { type: 'unknown' },
            results: {
                arrayType: {
                    name: 'sub-marker',
                    fields: {
                        id: { type: 'uint', required: true },
                        value: { type: 'string', required: true },
                        markerCategoryId: { type: 'uint', required: true },
                        markerCategory: { type: 'string', required: true },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'sector-list',
        description: 'Get sectors',
        fields: {
            count: { type: 'number', required: true },
            next: { type: 'unknown' },
            previous: { type: 'unknown' },
            results: {
                arrayType: {
                    name: 'sector',
                    fields: {
                        id: { type: 'uint', required: true },
                        name: { type: 'string', required: true },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'sub-sector-list',
        description: 'Get sub-sectors',
        fields: {
            count: { type: 'number', required: true },
            next: { type: 'unknown' },
            previous: { type: 'unknown' },
            results: {
                arrayType: {
                    name: 'sub-sector',
                    fields: {
                        id: { type: 'uint', required: true },
                        name: { type: 'string', required: true },
                        code: { type: 'string', required: true },
                        sectorId: { type: 'uint', required: true },
                        sectorName: { type: 'string', required: true },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'program-list',
        description: 'Get programs',
        fields: {
            count: { type: 'number', required: true },
            next: { type: 'unknown' },
            previous: { type: 'unknown' },
            results: {
                arrayType: {
                    name: 'program',
                    fields: {
                        id: { type: 'uint', required: true },
                        name: { type: 'string', required: true },
                        description: { type: 'string' },
                        code: { type: 'string', required: true },
                        iati: { type: 'string' },
                        totalBudget: { type: 'number', required: true },

                        sector: { type: 'array.base-entity', required: true },
                        subSector: { type: 'array.base-entity', required: true },
                        markerCategory: { type: 'array.base-entity', required: true },
                        markerValue: { type: 'array.base-entity', required: true },

                        component: { type: 'array.base-entity-with-code', required: true },

                        partner: { type: 'array.base-entity', required: true },
                        startDate: { type: 'string' },
                        endDate: { type: 'string' },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'partner-list',
        description: 'Get partners',
        fields: {
            count: { type: 'number', required: true },
            next: { type: 'unknown' },
            previous: { type: 'unknown' },
            results: {
                arrayType: {
                    name: 'partner-list-item',
                    fields: {
                        id: { type: 'uint', required: true },
                        name: { type: 'string', required: true },
                        code: { type: 'number', required: true },

                        description: { type: 'string' },
                        typeOfInstitution: { type: 'string' },
                        address: { type: 'string' },
                        email: { type: 'string' },
                        phoneNumber: { type: 'string' },
                        image: { type: 'string' },
                        thumbnail: { type: 'string' },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'indicator-list',
        description: 'Get metadata on indicators',
        fields: {
            count: { type: 'number', required: true },
            next: { type: 'unknown' },
            previous: { type: 'unknown' },
            results: {
                arrayType: {
                    name: 'indicator-list-item',
                    fields: {
                        id: { type: 'uint', required: true },
                        fullTitle: { type: 'string', required: true },
                        abstract: { type: 'string' },
                        category: { type: 'string', required: true },
                        source: { type: 'string' },
                        isDashboard: { type: 'boolean' },
                        isCovid: { type: 'boolean' },
                        unit: { type: 'string' },
                        dataType: { type: 'string' }, // only 'float' for now
                        federalLevel: { type: 'string' }, // only 'district', 'municipality', 'province', 'all' for now
                        filter: { type: 'unknown' }, // not used
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'indicator',
        description: 'Get list of indicators for province, district or municipality',
        fields: {
            /*
            // NOTE: Not available for province and district right now
            count: { type: 'number', required: true },
            next: { type: 'unknown' },
            previous: { type: 'unknown' },
            */
            results: {
                arrayType: {
                    name: 'indicator-item',
                    fields: {
                        id: { type: 'uint', required: true },
                        code: { type: 'string', required: true },
                        indicatorId: { type: 'uint', required: true },
                        value: { type: 'number', required: true },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'fivew-item',
        description: 'extendable fivew data',
        fields: {
            id: { type: 'uint', required: true },
            code: { type: 'string', required: true },
            name: { type: 'string', required: true },

            provinceName: { type: 'string' },
            districtName: { type: 'string' },

            allocatedBudget: { type: 'number' },
            program: { type: 'array.string', required: true },
            component: { type: 'array.string', required: true },
            partner: { type: 'array.string', required: true },
            sector: { type: 'array.string', required: true },
            subSector: { type: 'array.string', required: true },
            markerCategory: { type: 'array.string', required: true },
            markerValue: { type: 'array.string', required: true },
        },
    },
    {
        name: 'fivew-province',
        description: 'Get 5W data for province',
        fields: {
            results: { type: 'array.fivew-item', required: true },
        },
    },
    {
        name: 'fivew-district',
        description: 'Get 5W data for district',
        fields: {
            results: {
                arrayType: {
                    extends: 'fivew-item',
                    name: 'fivew-item-district',
                    fields: {
                        provinceName: { type: 'string', required: true },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'fivew-municipality',
        description: 'Get 5W data for municipality',
        fields: {
            results: {
                arrayType: {
                    extends: 'fivew-item',
                    name: 'fivew-item-municipality',
                    fields: {
                        provinceName: { type: 'string', required: true },
                        districtName: { type: 'string', required: true },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'district',
        description: 'Get list of districts',
        fields: {
            count: { type: 'number', required: true },
            next: { type: 'unknown' },
            previous: { type: 'unknown' },
            results: {
                arrayType: {
                    name: 'district-item',
                    fields: {
                        id: { type: 'uint', required: true },
                        code: { type: 'string', required: true },
                        provinceId: { type: 'uint', required: true },
                        name: { type: 'string', required: true },
                        provinceName: { type: 'string', required: true },

                        nCode: { type: 'number' }, // Not used
                        // TODO: Fix this
                        bbox: { type: 'string', required: true },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'municipality',
        description: 'Get list of municipalities',
        fields: {
            count: { type: 'number', required: true },
            next: { type: 'unknown' },
            previous: { type: 'unknown' },
            results: {
                arrayType: {
                    name: 'municipality-item',
                    fields: {
                        id: { type: 'uint', required: true },
                        code: { type: 'string', required: true },
                        provinceId: { type: 'uint', required: true },
                        districtId: { type: 'uint', required: true },
                        name: { type: 'string', required: true },
                        // TODO: Fix this
                        bbox: { type: 'string', required: true },

                        districtName: { type: 'string', required: true },
                        provinceName: { type: 'string', required: true },

                        gnTypeNp: { type: 'string' }, // Gaunpalika, Nagarpalika, Mahanagarpalika, Upamahanagarpalika
                        hlcitCode: { type: 'string' }, // Not used
                        population: { type: 'number' }, // Not used
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'province',
        description: 'Get list of provinces',
        fields: {
            count: { type: 'number', required: true },
            next: { type: 'unknown' },
            previous: { type: 'unknown' },
            results: {
                arrayType: {
                    name: 'province-item',
                    fields: {
                        id: { type: 'uint', required: true },
                        code: { type: 'string', required: true },
                        name: { type: 'string', required: true },
                        // TODO: Fix this
                        bbox: { type: 'string', required: true },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'program-profile',
        description: 'Get data of program profile',
        fields: {
            programName: { type: 'string', required: true },
            startDate: { type: 'string', required: true },
            endDate: { type: 'string', required: true },
            description: { type: 'string' },
            totalBudget: { type: 'number', required: true },
            provinceCount: { type: 'number', required: true },
            districtCount: { type: 'number', required: true },
            municiaplityCount: { type: 'number', required: true },
            federalLevelComponents: { type: 'array.string', required: true },
            activemap: {
                arrayType: {
                    name: 'active-map',
                    fields: {
                        code: { type: 'string', required: true },
                        name: { type: 'string', required: true },
                    },
                },
            },
        },
    },
    {
        name: 'region-profile',
        description: 'Get data of region profile',
        fields: {
            activeSectors: { type: 'array.string' },
            fivewdata: {
                arrayType: {
                    name: 'fivew-data',
                    fields: {
                        componentCount: { type: 'number' },
                        programCount: { type: 'number' },
                        sectorCount: { type: 'number' },
                        supplierCount: { type: 'number' },
                        totalBudget: { type: 'number' },
                    },
                },
            },
            indicatordata: {
                arrayType: {
                    name: 'indicator-data',
                    fields: {
                        code: { type: 'number', required: true },
                        indicator: { type: 'string', required: true },
                        indicatorId: { type: 'number', required: true },
                        totalBudget: { type: 'number', required: true },
                    },
                },
            },
        },
    },
    {
        name: 'region-dendogram',
        description: 'Get data of region dendogram',
        fields: {
            results: {
                arrayType: {
                    name: 'dendogram-data',
                    fields: {
                        name: { type: 'string', required: true },
                        children: {
                            arrayType: {
                                name: 'dendogram-children',
                                fields: {
                                    name: { type: 'string', required: true },
                                    children: {
                                        arrayType: {
                                            name: 'child',
                                            fields: {
                                                name: { type: 'string', required: true },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    {
        name: 'pop-up',
        description: 'Get pop up data',
        fields: {
            totalBudget: { type: 'number', required: true },
            programs: {
                arrayType: {
                    name: 'program',
                    fields: {
                        id: { type: 'number', required: true },
                        program: { type: 'string', required: true },
                        programBudget: { type: 'number', required: true },
                        markers: {
                            arrayType: {
                                name: 'marker',
                                fields: {
                                    markerCategory: { type: 'string', required: true },
                                    markerValue: { type: 'string', required: true },
                                },
                            },
                        },
                        components: {
                            arrayType: {
                                name: 'component',
                                fields: {
                                    id: { type: 'number', required: true },
                                    name: { type: 'string', required: true },
                                    componentBudget: { type: 'number', required: true },
                                    partners: {
                                        arrayType: {
                                            name: 'partner',
                                            fields: {
                                                id: { type: 'number', required: true },
                                                name: { type: 'string', required: true },
                                                partnerBudget: { type: 'number', required: true },
                                            },
                                        },
                                    },
                                    sectors: {
                                        arrayType: {
                                            name: 'partner',
                                            fields: {
                                                id: { type: 'number', required: true },
                                                sector: { type: 'string', required: true },
                                                subSector: { type: 'string', required: true },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    {
        name: 'faq',
        description: 'Get faq data in about page',
        fields: {
            count: { type: 'number' },
            next: { type: 'number' },
            previous: { type: 'number' },
            results: {
                arrayType: {
                    name: 'question-answers',
                    fields: {
                        id: { type: 'number', required: true },
                        question: { type: 'string', required: true },
                        answer: { type: 'string', required: true },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'terms-conditions',
        description: 'Get terms and conditions data in about page',
        fields: {
            count: { type: 'number' },
            next: { type: 'number' },
            previous: { type: 'number' },
            results: {
                arrayType: {
                    name: 'question-answers',
                    fields: {
                        id: { type: 'number', required: true },
                        title: { type: 'string', required: true },
                        subTitle: { type: 'string', required: true },
                    },
                },
                required: true,
            },
        },
    },
];

const warning = !isProduction;
const dict = new Dict({ warning });

[
    ...basicTypes,
    ...userDefinedSchemas,
].forEach(schema => dict.put(schema.name, schema));

export default dict;
