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
        path: '/',
        name: 'dashboard',
        title: 'Overview',
        load: lazy(() => import('../../../views/Dashboard')),
    },
    {
        path: '/output/',
        name: 'output',
        title: 'Output',
        load: lazy(() => import('../../../views/Output')),
    },
    {
        path: '/about/',
        name: 'about',
        title: 'About',
        load: lazy(() => import('../../../views/About/AboutPage')),
    },
    {
        path: '/faqs/',
        name: 'faq',
        title: 'FAQs',
        load: lazy(() => import('../../../views/About/FaqPage')),
    },
    {
        path: '/metadata/',
        name: 'metadata',
        title: 'Metadata',
        load: lazy(() => import('../../../views/About/MetadataPage')),
    },
    {
        path: '/termsandconditions/',
        name: 'termsandconditions',
        title: 'Terms & Conditions',
        load: lazy(() => import('../../../views/About/TermsAndConditionsPage')),
    },
    {
        path: '/feedback/',
        name: 'feedback',
        title: 'Feedback Form',
        load: lazy(() => import('../../../views/About/FeedbackPage')),
    },
    {
        path: '/region-profile/',
        name: 'regionProfile',
        title: 'Region Profile',
        load: lazy(() => import('../../../views/RegionProfile')),
    },
    {
        path: '/program-profile/',
        name: 'programProfile',
        title: 'Program Profile',
        load: lazy(() => import('../../../views/ProgramProfile')),
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
