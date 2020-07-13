import { isTruthyString } from '@togglecorp/fujs';
import {
    MultiResponse,
    Program,
} from '#types';
import { apiEndPoint } from '#utils/constants';
import { prepareUrlParams as p } from '#utils/common';

import useRequest from '#hooks/useRequest';

export interface ExtendedProgram extends Program {
    devTrackerLink?: string;
    dPortalLink?: string;
    componentCount: number;
    sectorCount: number;
    partnerCount: number;
}

function useExtendedProgram(
    programs: number[],
    preserveResponse = true,
): [boolean, ExtendedProgram[] | undefined] {
    const params = p({
        program: programs,
    });

    const programUrl = isTruthyString(params)
        ? `${apiEndPoint}/core/program/?${params}`
        : `${apiEndPoint}/core/program/`;

    const [
        programsPending,
        programListResponse,
    ] = useRequest<MultiResponse<Program>>(programUrl, 'program-list', undefined, preserveResponse);

    const extendedPrograms = programListResponse?.results.map(program => ({
        ...program,
        componentCount: program.component.length,
        sectorCount: program.sector.length,
        partnerCount: program.partner.length,
        dPortalLink: program.iati
            ? `http://d-portal.org/ctrack.html?country_code=NP#view=act&aid=${program.iati}`
            : undefined,
        devTrackerLink: program.iati
            ? `https://devtracker.dfid.gov.uk/projects/${program.iati}`
            : undefined,
    }));

    return [programsPending, extendedPrograms];
}

export default useExtendedProgram;
