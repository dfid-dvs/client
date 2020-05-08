import Dict, { basicTypes, Schema } from '@togglecorp/ravl';
import { isProduction } from '#config/env';

const userDefinedSchemas: Schema[] = [
    {
        name: 'dbentity',
        description: 'Defines all the attributes common to db entities',
        fields: {
            id: { type: 'uint', required: true },
            createdOn: { type: 'string', required: true }, // date
            modifiedOn: { type: 'string' }, // date
        },
    },
    {
        name: 'indicatorList',
        description: 'Get metadata on indicators',
        fields: {
            results: {
                arrayType: {
                    name: 'indicator-list-item',
                    fields: {
                        id: { type: 'uint', required: true },
                        fullTitle: { type: 'string', required: true },
                        abstract: { type: 'string'},
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
            // Not available for province and district right now
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
