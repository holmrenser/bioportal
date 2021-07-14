/* @flow */
/* global Package: false, Npm: false */

Package.describe({
  name: 'mhagmajer:server-router',
  version: '1.2.3_1',
  summary: 'Server router with authentication for Meteor',
  git: 'https://github.com/mhagmajer/server-router',
  documentation: 'README.md',
});

Npm.depends({
  'path-to-regexp': '1.7.0',
  'query-string': '4.3.4',
  'url-parse': '1.1.9',
  invariant: '2.2.4',
});

Package.onUse((api) => {
  api.versionsFrom('1.8.2');
  api.use([
    'typescript@4.1.2',
    'underscore',
    'ejson',
    'ecmascript',
    'modules',
    'accounts-base',
    'webapp',
  ]);
  api.mainModule('src/server/server-router.ts', 'server');
  api.mainModule('src/client/server-router-client.ts', 'client');
});

Package.onTest((api) => {
  api.use([
    'typescript',
    'ecmascript',
    'tinytest',
    'mhagmajer:server-router',
  ]);
  api.mainModule('server-router-tests.js');
});
