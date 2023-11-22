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
      'input-media',
      'media-source',
      'media-group',
      'hooks',

      'scripts',
      'docs'
    ]],
    'scope-case': [2, 'always', 'kebab-case']
  }
}
