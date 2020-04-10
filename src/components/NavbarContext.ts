import React from 'react';
import { NavbarContextProps } from '#types';

const noOp = () => {};

const navbarContext = React.createContext<NavbarContextProps>({
    exploreBy: 'programs',
    setExploreBy: noOp,
    regionLevel: 'province',
    setRegionLevel: noOp,
});

export default navbarContext;
