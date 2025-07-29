module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // 코딩 컨벤션에 맞는 규칙들
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],

    // 한국어 프로젝트 특성 고려
    'no-console': 'warn', // console.log는 경고만
    'no-unused-vars': 'warn',
    'no-undef': 'error',

    // 보안 관련
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',

    // 코드 품질
    'prefer-const': 'warn',
    'no-var': 'warn',
    eqeqeq: 'warn',
    curly: 'warn',
  },
  ignorePatterns: ['node_modules/', 'uploads/', 'dev-history/', '*.html', '*.css'],
};
