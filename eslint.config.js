const js = require('@eslint/js');

module.exports = [
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'commonjs',
            globals: {
                process: 'readonly',   // permite usar process
                console: 'readonly'    // permite usar console
            }
        },
        rules: {
            ...js.configs.recommended.rules,
            semi: ['error', 'always'], // exige punto y coma
            quotes: ['error', 'single'], // exige comillas simples
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // variables no usadas permitidas si empiezan con _
        }
    }
]