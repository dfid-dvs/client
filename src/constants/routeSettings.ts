export interface Route {
    path: string;
    name: string;
    title: string;
    load: any;
}
export interface NavbarRoute extends Route {
    navbar: true;
    iconName: string;
    disabled?: boolean;
}
export interface FallbackRoute {
    default: true;
    title: string;
    name: string;
    load: any;
    path: undefined;
}

export function hasNavbar(route: SomeRoute): route is NavbarRoute {
    return !!(route as NavbarRoute).navbar;
}

export type SomeRoute = Route | NavbarRoute | FallbackRoute;

const routeSettings: SomeRoute[] = [
    {
        path: '/',
        name: 'home',
        title: 'Home',
        load: () => import('../views/Home'),
        navbar: true,
    },
    {
        path: '/dashboard/',
        name: 'dashboard',
        title: 'Dashboard',
        load: () => import('../views/Dashboard'),
        navbar: true,
    },
    {
        path: '/infographics/',
        name: 'infographics',
        title: 'Infographics',
        load: () => import('../views/Infographics'),
        navbar: true,
    },
    {
        path: '/glossary/',
        name: 'glossary',
        title: 'Glossary',
        load: () => import('../views/Glossary'),
        navbar: true,
    },

    {
        path: '/403/',
        name: 'fourHundredThree',
        title: '403',
        load: () => import('../views/FourHundredThree'),
    },

    {
        path: undefined,
        name: 'fourHundredFour',
        title: '404',
        load: () => import('../views/FourHundredFour'),
        default: true,
    },
];

export default routeSettings;
