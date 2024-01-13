module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [
      'puregram',
      'hear',
      'prompt',
      'scenes',
      'session',
      'utils',
      'callback-data',
      'markup',

      'eslint',
      'commitlint',
      'husky',

      'scripts'
    ]],
    'scope-case': [2, 'always', 'kebab-case']
  }
}
