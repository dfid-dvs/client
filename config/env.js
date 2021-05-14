module.exports = (env) => {
    if (!env) {
        return {};
    }
    const reduceFn = (acc, key) => {
        acc[key] = JSON.stringify(env[key]);
        return acc;
    };
    const initialState = {};

    const ENV_VARS = Object.keys(env)
        .filter(v => v.startsWith('REACT_APP_'))
        .reduce(reduceFn, initialState);
    return ENV_VARS;
};
