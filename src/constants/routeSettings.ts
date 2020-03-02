import { lazy } from 'react';

export interface Route {
    path: string;
    name: string;
    title: string;
    load: any;
}
export interface NavbarRoute extends Route {
    hideNavbar?: boolean;
    iconName: string;
    disabled?: boolean;
}
export interface FallbackRoute {
    default: false;
    title: string;
    name: string;
    load: any;
    path: undefined;
}

export type SomeRoute = Route | NavbarRoute | FallbackRoute;

const routeSettings: SomeRoute[] = [
    {
        path: '/dashboard/',
        name: 'dashboard',
        title: 'Dashboard',
        load: lazy(() => import('../views/Dashboard')),
    },
    {
        path: '/infographics/',
        name: 'infographics',
        title: 'Infographics',
        load: lazy(() => import('../views/Infographics')),
    },
    {
        path: '/glossary/',
        name: 'glossary',
        title: 'Glossary',
        load: lazy(() => import('../views/Glossary')),
    },
    {
        path: '/',
        name: 'home',
        title: 'Home',
        load: lazy(() => import('../views/Home')),
    },
    {
        path: '/403/',
        name: 'fourHundredThree',
        title: '403',
        load: lazy(() => import('../views/FourHundredThree')),
    },
    {
        path: undefined,
        name: 'fourHundredFour',
        title: '404',
        load: lazy(() => import('../views/FourHundredFour')),
        default: false,
    },
];

export default routeSettings;
