import React, { lazy } from 'react';
import { Redirect } from 'react-router-dom';

export interface Route {
    path: string;
    name: string;
    title: string;
    load: any;

    hideNavbar?: boolean;
    hideOnNavbar?: boolean;
}

export interface FallbackRoute {
    default: false;
    path: undefined;
    name: string;
    title: string;
    load: any;

    hideNavbar?: boolean;
}

export type SomeRoute = Route | FallbackRoute;

const routeSettings: SomeRoute[] = [
    {
        path: '/dashboard/',
        name: 'dashboard',
        title: 'Dashboard',
        load: lazy(() => import('../../../views/Dashboard')),
    },
    {
        path: '/covid19/',
        name: 'covid19',
        title: 'COVID-19',
        load: lazy(() => import('../../../views/Covid19')),
    },
    {
        path: '/infographics/',
        name: 'infographics',
        title: 'Infographics',
        load: lazy(() => import('../../../views/Infographics')),
    },
    {
        path: '/',
        name: 'dashboard',
        title: 'Dashboard',
        load: () => <Redirect to="/dashboard/" />,
        hideOnNavbar: true,
    },
    {
        path: '/403/',
        name: 'fourHundredThree',
        title: '403',
        load: lazy(() => import('../../../views/FourHundredThree')),
    },
    {
        path: undefined,
        name: 'fourHundredFour',
        title: '404',
        load: lazy(() => import('../../../views/FourHundredFour')),
        default: false,
    },
];

export default routeSettings;