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
      'api',
      'updates',
      'eslint',
      'commitlint'
    ]],
    'scope-case': [2, 'always', 'kebab-case']
  }
}
