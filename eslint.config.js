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
            indent: ['error', 2, { SwitchCase: 1 }],   // define indentación de 2 espacios
            eqeqeq: ['error', 'always'],               // exige === para comparaciones seguras
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // variables no usadas permitidas si empiezan con _
            'no-var': 'error',                         // prohíbe var
            'prefer-const': 'error',                   // usa const cuando la variable no cambia
            'require-await': 'error',                  // prohíbe async sin await
            'no-return-await': 'error',                // evita return await innecesario
            'no-throw-literal': 'error',               // obliga a usar Error() en throw
            'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off' // no permite console.log en producción
        }
    }
]