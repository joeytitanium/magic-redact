module.exports = {
  extends: ['mantine', 'plugin:@next/next/recommended'],
  plugins: ['react-hooks', 'no-relative-import-paths'],
  overrides: [
    {
      files: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    },
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'consistent-return': ['off'],
    'react/react-in-jsx-scope': 'off',
    'import/extensions': 'off',
    indent: ['off'],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/no-unescaped-entities': 'off',
    'react/jsx-key': 'error',
    'import/order': ['off'],
    'no-plusplus': ['off'],
    'no-relative-import-paths/no-relative-import-paths': [
      'warn',
      { allowSameFolder: true, prefix: '@' },
    ],
    'no-use-before-define': ['off'],
    'no-void': ['error', { allowAsStatement: true }], // this works well with no-floating-promises
    '@next/next/no-head-element': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/no-floating-promises': 'error',

    // 'import/order': [
    //   'error',
    //   {
    //     groups: ['index', 'sibling', 'parent', 'internal', 'external', 'builtin'],
    //   },
    // ],
  },
};
