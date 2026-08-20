import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

/**
 * ESLint 9 flat config. eslint-config-next 16 ships native flat configs, so no
 * FlatCompat shim is needed (and the shim in fact crashes on it).
 */
const config = [
    {
        ignores: [
            '.next/**',
            'node_modules/**',
            'prisma/generated/**',
            'public/sw.js',
            'next-env.d.ts',
        ],
    },
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        rules: {
            // `_`-prefixed arguments are deliberately unused route handler params.
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
    },
    {
        // Tests assert against loosely-typed fixtures and use short-circuit
        // expressions for their assertions.
        files: ['tests/**/*'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
        },
    },
]

export default config
