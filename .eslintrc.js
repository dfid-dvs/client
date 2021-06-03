module.exports = {
    extends: [
        'airbnb',
        'plugin:postcss-modules/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    env: {
        browser: true,
        jest: true,
    },
    plugins: [
        'react',
        'react-hooks',
        'import',
        'postcss-modules',
        '@typescript-eslint',
    ],
    settings: {
        'postcss-modules': {
            camelCase: 'camelCaseOnly',
        },
        'import/resolver': {
            'babel-module': {
                root: ['.'],
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
                alias: {
                    '#components': './src/components',
                    '#config': './src/config',
                    '#request': './src/request',
                    '#resources': './src/resources',
                    '#schema': './src/schema',
                    '#ts': './src/ts',
                    '#utils': './src/utils',
                    '#views': './src/views',
                    '#types': './src/typings',
                    '#hooks': './src/hooks',
                    '#remap': './src/vendor/re-map',
                },
            },
        },
        react: {
            version: 'detect',
        },
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        ecmaFeatures: {
            jsx: true,
        },
        sourceType: 'module',
        allowImportExportEverywhere: true,
    },
    rules: {
        strict: 0,
        indent: ['error', 4, { SwitchCase: 1 }],
        'no-console': 0,

        'react/jsx-indent': [2, 4],
        'react/jsx-indent-props': [2, 4],
        'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
        'react/prop-types': [1, { ignore: [], customValidators: [], skipUndeclared: false }],
        'react/forbid-prop-types': [1],
        'react/destructuring-assignment': [1, 'always', { ignoreClassFields: true }],
        'react/sort-comp': [1, {
            order: [
                'static-methods',
                'constructor',
                'lifecycle',
                'everything-else',
                'render',
            ],
        }],

        'jsx-a11y/anchor-is-valid': ['error', {
            components: ['Link'],
            specialLink: ['to'],
        }],

        'import/extensions': ['off', 'never'],
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],

        // 'postcss-modules/no-unused-class': [1, { 'camelCase': true }],
        // 'postcss-modules/no-undef-class': [1, { 'camelCase': true }],
        'postcss-modules/no-unused-class': 'warn',
        'postcss-modules/no-undef-class': 'warn',

        'prefer-destructuring': 'warn',
        'function-paren-newline': ['warn', 'consistent'],
        'object-curly-newline': [2, {
            ObjectExpression: { consistent: true },
            ObjectPattern: { consistent: true },
            ImportDeclaration: { consistent: true },
            ExportDeclaration: { consistent: true },
        }],

        'jsx-a11y/label-has-for': 'warn',

        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/explicit-function-return-type': 0,

        // note you must disable the base rule as it can report incorrect errors
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error'],

        // note you must disable the base rule as it can report incorrect errors
        'no-unused-vars': 'off',

        // NOTE: https://github.com/typescript-eslint/typescript-eslint/issues/2077
        camelcase: 0,
        'react/jsx-props-no-multi-spaces': 0,
        '@typescript-eslint/no-empty-function': 0,
        '@typescript-eslint/explicit-module-boundary-types': 0,

        '@typescript-eslint/no-unused-vars': 'warn',
        'react/no-unused-state': 'warn',
        'react/default-props-match-prop-types': ['warn', {
            allowRequiredDefaults: true,
        }],
        'react/require-default-props': ['warn', { ignoreFunctionalComponents: true }],

        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],

        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
    },
};
