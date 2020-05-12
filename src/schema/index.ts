import Dict, { basicTypes, Schema } from '@togglecorp/ravl';
import { isProduction } from '#config/env';

/* eslint-disable @typescript-eslint/camelcase */

const userDefinedSchemas: Schema[] = [
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
                        style: { type: 'unknown' },
                        geoserverUrl: { type: 'string', required: true }, // url
                        type: { type: 'string', required: true }, // enum: raster, vector
                        category: { type: 'string', required: true },
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
            results: {
                arrayType: {
                    name: 'indicator-list-item',
                    fields: {
                        id: { type: 'uint', required: true },
                        fullTitle: { type: 'string', required: true },
                        abstract: { type: 'string' },
                        category: { type: 'string', required: true },
                        source: { type: 'string' },
                        isCovid: { type: 'boolean' },
                        unit: { type: 'string' },
                        dataType: { type: 'string' }, // only 'float' for now
                        federalLevel: { type: 'string' }, // only 'palika level' for now
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
                        maleBeneficiary: { type: 'number' },
                        femaleBeneficiary: { type: 'number' },
                        totalBeneficiary: { type: 'number' },
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
