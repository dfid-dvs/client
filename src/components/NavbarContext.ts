import React from 'react';
import { NavbarContextProps } from '#types';

const noOp = () => {};

const navbarContext = React.createContext<NavbarContextProps>({
    exploreBy: 'regions',
    setExploreBy: noOp,
    regionLevel: 'municipality',
    setRegionLevel: noOp,
});

export default navbarContext;
