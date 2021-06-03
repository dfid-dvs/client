import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import '../../node_modules/mapbox-gl/dist/mapbox-gl.css';
import './styles.css';

import App from './App';

interface Props {
}

function Root(props: Props) {
    return (
        <BrowserRouter>
            <App {...props} />
        </BrowserRouter>
    );
}

export default Root;
