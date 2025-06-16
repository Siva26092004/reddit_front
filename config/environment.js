/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'reddit-client',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    contentSecurityPolicy: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http://localhost:4200", "http://localhost:49152"],
      'script-src-elem': ["'self'", "'unsafe-inline'", "http://localhost:4200", "http://localhost:49152"],
      'font-src': ["'self'", "http://localhost:4200"],
      'img-src': "'self' data: https: http: https://res.cloudinary.com",
      'media-src': "'self' data: https: http: https://res.cloudinary.com",
      'style-src': ["'self'", "'unsafe-inline'", "http://localhost:4200"],
      'style-src-elem': ["'self'", "'unsafe-inline'", "http://localhost:4200"],
      'connect-src': ["'self'", "ws://localhost:49152", "ws://localhost:49152/livereload", "ws://0.0.0.0:49152", "http://localhost:8080", "http://localhost:8080/reddit_server/api/posts", "http://localhost:8080/reddit_server/api/subreddits", "http://localhost:4200"],
      'media-src': ["'self'", "http://localhost:4200"]
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    ENV.baseURL = '/';
    ENV.locationType = 'none';
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.contentSecurityPolicy['script-src'] = ["'self'", "'unsafe-eval'"];
    ENV.contentSecurityPolicy['script-src-elem'] = ["'self'"];
    ENV.contentSecurityPolicy['connect-src'] = ["'self'"];
  }

  return ENV;
};
