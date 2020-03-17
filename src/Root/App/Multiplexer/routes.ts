import { lazy } from 'react';
import { isDefined } from '@togglecorp/fujs';

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
const Dashboard = lazy(() => import('../../../views/Dashboard'));

const routeSettings: SomeRoute[] = [
    {
        path: '/dashboard/',
        name: 'dashboard',
        title: 'Dashboard',
        load: Dashboard,
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
        load: Dashboard,
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
