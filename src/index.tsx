import React from 'react';
import ReactDOM from 'react-dom';
import { init } from '@sentry/react';

import Root from './Root';

if (process.env.NODE_ENV === 'production') {
    console.info('Sentry initialized');
    init({
        dsn: 'https://fc0785ad0fdc455bbb0cf22bbf057f81@o414061.ingest.sentry.io/5302893',
        release: process.env.REACT_APP_VERSION,
    });
}

console.info('React version', React.version);

const rootElement = document.getElementById('dfid-root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<Root />);
} else {
    console.error('Root element was not found');
}
