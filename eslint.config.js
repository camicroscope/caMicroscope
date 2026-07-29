const {FlatCompat} = require('@eslint/eslintrc');
const globals = require('globals');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'core/openseadragon/**',
      'core/openseadragonzoomlevels.js',
      'core/openseadragonzoomlevels.BAK.js',
      'core/openseadragon-scalebar.js',
      'core/openseadragon-scalebar.BAK.js',
      'core/openseadragon-imaginghelper.min.js',
      'core/openseadragon-imaginghelper.min.BAK.js',
      'apps/landing/skel.min.js',
      'apps/landing/util.js',
      'apps/landing/jquery.dropotron.min.js',
      'apps/landing/jquery.min.js',
      'apps/landing/jquery.scrollex.min.js',
      'apps/segment/opencv.js',
      'common/bootstrap-tour-standalone/bootstrap-tour-standalone.min.js',
      'apps/viewer/turf.min.js',
    ],
  },
  ...compat.extends('google'),
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },
    },
    rules: {
      'require-jsdoc': 0,
      'valid-jsdoc': 0,
      'max-len': ['error', {code: 125, ignoreTemplateLiterals: true}],
      'no-unused-vars': 0,
      'no-var': 0,
      'new-cap': 0,
      'prefer-const': 0,
      'linebreak-style': 0,
    },
  },
];
