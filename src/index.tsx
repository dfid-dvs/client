import React from 'react';
import ReactDOM from 'react-dom';

import Root from './Root';

console.info('React version', React.version);

const rootElement = document.getElementById('dfid-root');
ReactDOM.createRoot(rootElement).render(<Root />);
