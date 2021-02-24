import React from 'react';
import { DomainContextProps } from '#types';

const domainContext = React.createContext<DomainContextProps>({
    regionLevel: 'province',
    setRegionLevel: (region) => {
        console.warn('Trying to set region', region);
    },
    markers: [],
    setMarkers: (markers) => {
        console.warn('Trying to set programs', markers);
    },
    programs: [],
    setPrograms: (programs) => {
        console.warn('Trying to set programs', programs);
    },
    partners: [],
    setPartners: (partners) => {
        console.warn('Trying to set programs', partners);
    },
    sectors: [],
    setSectors: (sectors) => {
        console.warn('Trying to set programs', sectors);
    },
});

export default domainContext;
