module.exports = {
  env: {
    node: true
  },
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/eslint-recommended'
  ],
  globals: {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module'
  },
  plugins: [
    'import',
    '@typescript-eslint'
  ],
  rules: {
    indent: [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    quotes: [
      'error',
      'single'
    ],
    semi: [
      'error',
      'always'
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        'js': 'never',
        'ts': 'never'
      }
    ],
    'comma-dangle': 'off',
    'no-unused-vars': 'off',
    'no-restricted-syntax': 'off',
    camelcase: 'off',
    'import/prefer-default-export': 'off',
    'no-await-in-loop': 'off',
    'no-continue': 'off',
    'import/no-cycle': 'off',
    'no-param-reassign': 'off'
  },
  overrides: [
    {
      files: ['packages/*/testlib/**/*.testlib.ts'],
      env: {
        jest: true
      }
    }
  ]
};
