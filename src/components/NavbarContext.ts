import React from 'react';
import { NavbarContextProps } from '#types';

const navbarContext = React.createContext<NavbarContextProps>({
    regionLevel: 'province',
    setRegionLevel: (region) => {
        console.warn('Trying to set region', region);
    },
});

export default navbarContext;
