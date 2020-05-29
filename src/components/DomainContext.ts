import React from 'react';
import { DomainContextProps } from '#types';

const domainContext = React.createContext<DomainContextProps>({
    regionLevel: 'province',
    setRegionLevel: (region) => {
        console.warn('Trying to set region', region);
    },
});

export default domainContext;
