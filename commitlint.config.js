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
      'commitlint',
      'husky',

      'keyboards',
      'contexts',
      'mixins',
      'attachments',
      'structures',
      'parse-mode',
      'media-source',
      'media-group',

      'scripts',
      'docs'
    ]],
    'scope-case': [2, 'always', 'kebab-case']
  }
}
