Package.describe({
  name: 'radzserg:rbac',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
    api.versionsFrom('1.0.3.1');

    api.use('underscore');
    api.use('ui@1.0.5', 'client');

    api.addFiles([
        'auth_manager.js',
        'global_variables.js'
    ]);
    api.addFiles('ui.js', 'client');

    if (typeof api.export !== 'undefined') {
        api.export("RbacManager");
    }
});

Package.onTest(function (api) {
    api.use(["underscore", "tinytest"]);
    api.use('radzserg:rbac');

    // tests
    api.addFiles('./tests/rbac-tests.js');
});