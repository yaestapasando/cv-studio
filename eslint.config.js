const html = require('eslint-plugin-html');
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.js', '**/*.html'],
        plugins: {
            html
        },
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'commonjs',
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        rules: {
            'no-console': 'off',
            'indent': ['error', 4]
        }
    }
];
