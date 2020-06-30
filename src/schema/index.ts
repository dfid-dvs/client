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
        name: 'covid-fields',
        fields: {
            field: {
                arrayType: {
                    name: 'covid-field',
                    fields: {
                        name: { type: 'string', required: true },
                        value: { type: 'string', required: true },
                    },
                },
                required: true,
            },
            kathmanduActivity: { type: 'array.string', required: true },
            other: { type: 'array.string', required: true },
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
        name: 'corona-data',
        description: 'Get corona data from nepalcorona.info',
        fields: {
            tested_positive: { type: 'uint', required: true },
            tested_negative: { type: 'uint', required: true },
            tested_total: { type: 'uint', required: true },
            in_isolation: { type: 'uint', required: true },
            quarantined: { type: 'uint', required: true },
            tested_rdt: { type: 'uint', required: true },
            pending_result: { type: 'uint', required: true },
            recovered: { type: 'uint', required: true },
            deaths: { type: 'uint', required: true },
            source: { type: 'string', required: true }, // url
            updated_at: { type: 'string', required: true }, // date
            latest_sit_report: {
                type: {
                    name: 'sit-report',
                    fields: {
                        type: { type: 'string', required: true }, // date
                        _id: { type: 'string', required: true }, // date
                        no: { type: 'uint', required: true },
                        date: { type: 'string', required: true },
                        url: { type: 'string', required: true },
                        created_at: { type: 'string', required: true },
                        updated_at: { type: 'string', required: true },
                        __v: { type: 'uint', required: true },
                    },
                },
                required: false,
            },
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

                                    circleColor: { type: 'string', required: true },
                                    circleRadius: { type: 'uint', required: true },
                                    fillColor: { type: 'string', required: true },
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

                        component: { type: 'array.base-entity', required: true },
                    },
                },
                required: true,
            },
        },
    },
    {
        name: 'covid-program-list',
        description: 'Get covid programs',
        fields: {
            count: { type: 'number', required: true },
            next: { type: 'unknown' },
            previous: { type: 'unknown' },
            results: {
                arrayType: {
                    name: 'covid-program',
                    fields: {
                        budget: { type: 'uint', required: true },
                        component: { type: 'string', required: true },
                        covidPriority_3_12_Months: { type: 'string' },
                        covidRecoveryPriority: { type: 'string', required: true },
                        deliveryInLockdown: { type: 'string', required: true },
                        districtCode: { type: 'string' },
                        id: { type: 'uint', required: true },
                        kathmanduActivity: { type: 'string', required: true },
                        municipalityCode: { type: 'string' },
                        projectStatus: { type: 'string', required: true },
                        providingTaToLocalGovernment: { type: 'string', required: true },
                        provinceCode: { type: 'string' },
                        secondTierPartner: { type: 'string', required: true },
                        sector: { type: 'string', required: true },
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
        name: 'fivew',
        description: 'Get 5W data for province, district or municipality',
        fields: {
            results: {
                arrayType: {
                    name: 'fivew-item',
                    fields: {
                        id: { type: 'uint', required: true },
                        code: { type: 'string', required: true },
                        name: { type: 'string', required: true },

                        allocatedBudget: { type: 'number' },
                        program: { type: 'array.string', required: true },
                        component: { type: 'array.string', required: true },
                        partner: { type: 'array.string', required: true },
                        sector: { type: 'array.string', required: true },
                        subSector: { type: 'array.string', required: true },
                        // markerCategory: { type: 'array.string', required: true },
                        // markerValue: { type: 'array.string', required: true },
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

                        nCode: { type: 'number' }, // Not used
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
