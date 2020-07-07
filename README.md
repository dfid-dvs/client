# DFID DVS ![CI](https://github.com/dfid-dvs/client/workflows/CI/badge.svg?branch=develop)

DFID Data Visualization System

## Getting Started

Before we start, clone this repository:

```
mkdir src/vendor
git clone git@github.com:toggle-corp/re-map.git src/vendor
```

Create an environment variable `.env` with following variables:

```
REACT_APP_MAPBOX_ACCESS_TOKEN=<your access token>
REACT_APP_API_SERVER_URL=<api endpoint>
REACT_APP_SERVER_URL=<dashboard enpoint>
```

Install dependencies, and run:

```
yarn install
yarn start
```
