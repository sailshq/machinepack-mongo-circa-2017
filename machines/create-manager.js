var _ = require('lodash');
var url = require('url');
var util = require('util');
var MongoClient = require('mongodb').MongoClient;

module.exports = {


  friendlyName: 'Create manager',


  description: 'Build and initialize a connection manager instance for this database.',


  extendedDescription:
  'The `manager` instance returned by this method contains any configuration that is necessary ' +
  'for communicating with the database and establishing connections (e.g. host, user, password) ' +
  'as well as any other relevant metadata. The manager will often also contain a reference ' +
  'to some kind of native container (e.g. a connection pool).\n' +
  '\n' +
  'Note that a manager instance does not necessarily need to correspond with a pool though--' +
  'it might simply be a container for storing config, or it might refer to multiple pools ' +
  '(e.g. a ClusterPool from felixge\'s `mysql` package).',


  inputs: {

    connectionString: {
      description: 'A string containing the/ primary configuration/credentials necessary for connecting to the database (almost always a URI).',
      extendedDescription:
        'If the database does not explicitly support a connection string, then careful, ' +
        'step-by-step instructions for generating the appropriate connection string (such ' +
        'as stringifying a JSON dictionary or using a particular string in conjunction with' +
        'information in the `meta` input) should be included in the `whereToGet` of this ' +
        'input definition. Driver implementors should use `extendedDescription` and/or ' +
        '`moreInfoUrl` for explaining what the connection string means rather than focusing ' +
        'on how to generate it (use `whereToGet` for that).',
      // example: 'mongodb://foo:bar@localhost:27017/thedatabase',
      example: '===',
      required: true
    },

    onUnexpectedFailure: {
      description: 'A function to call any time an unexpected error event is received from this manager or any of its connections.',
      extendedDescription:
        'This can be used for anything you like, whether that\'s sending an email to devops, ' +
        'or something as simple as logging a warning to the console.\n' +
        '\n' +
        'For example:\n' +
        '```\n' +
        'onUnexpectedFailure: function (err) {\n' +
        '  console.warn(\'Unexpected failure in database manager:\',err);\n' +
        '}\n' +
        '```',
      example: '->'
    },

    meta: {
      friendlyName: 'Meta (custom)',
      description: 'Additional stuff to pass to the driver.',
      extendedDescription: 'This is reserved for custom driver-specific extensions. Please refer to the documentation for the driver you are using for more specific information.',
      example: '==='
    }

  },


  exits: {

    success: {
      description: 'The manager was successfully created.',
      extendedDescription:
        'The new manager should be passed in to `getConnection()`.' +
        'Note that _no matter what_, this manager must be capable of ' +
        'spawning an infinite number of connections (i.e. via `getConnection()`). ' +
        'The implementation of how exactly it does this varies on a driver-by-driver ' +
        'basis; and it may also vary based on the configuration passed into the `meta` input.',
      outputVariableName: 'report',
      outputDescription: 'The `manager` property is a manager instance that will be passed into `getConnection()`. The `meta` property is reserved for custom driver-specific extensions.',
      // example: {
      //   manager: '===',
      //   meta: '==='
      // }
      example: '==='
    },

    malformed: {
      description: 'The provided connection string is malformed.',
      extendedDescription: 'The format of connection strings varies across different databases and their drivers. This exit indicates that the provided string is not valid as per the custom rules of this driver. Note that if this exit is traversed, it means the driver DID NOT ATTEMPT to create a manager-- instead the invalid connection string was discovered during a check performed beforehand.',
      outputVariableName: 'report',
      outputDescription: 'The `error` property is a JavaScript Error instance explaining that (and preferably "why") the provided connection string is invalid. The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        error: '===',
        meta: '==='
      }
    },

    failed: {
      description: 'Could not create a connection manager for this database using the specified connection string.',
      extendedDescription:
        'If this exit is called, it might mean any of the following:\n' +
        ' + the credentials encoded in the connection string are incorrect\n' +
        ' + there is no database server running at the provided host (i.e. even if it is just that the database process needs to be started)\n' +
        ' + there is no software "database" with the specified name running on the server\n' +
        ' + the provided connection string does not have necessary access rights for the specified software "database"\n' +
        ' + this Node.js process could not connect to the database, perhaps because of firewall/proxy settings\n' +
        ' + any other miscellaneous connection error\n' +
        '\n' +
        'Note that even if the database is unreachable, bad credentials are being used, etc, ' +
        'this exit will not necessarily be called-- that depends on the implementation of the driver ' +
        'and any special configuration passed to the `meta` input. e.g. if a pool is being used that spins up ' +
        'multiple connections immediately when the manager is created, then this exit will be called if any of ' +
        'those initial attempts fail. On the other hand, if the manager is designed to produce adhoc connections, ' +
        'any errors related to bad credentials, connectivity, etc. will not be caught until `getConnection()` is called.',
      outputVariableName: 'report',
      outputDescription: 'The `error` property is a JavaScript Error instance with more information and a stack trace. The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        error: '===',
        meta: '==='
      }
    }

  },

  fn: function createManager(inputs, exits) {
    // Note:
    // Support for different types of managers is database-specific, and is not
    // built into the Waterline driver spec-- however this type of configurability
    // can be instrumented using `meta`.
    //
    // Feel free to fork this driver and customize as you see fit.  Also note that
    // contributions to the core driver in this area are welcome and greatly appreciated!


    // Build a local variable (`_clientConfig`) to house a dictionary
    // of additional Mongo options that will be passed into the Server config.
    //
    // This is pulled from the `connectionString` and `meta` inputs, and used for
    // configuring stuff like `host` and `password`.
    //
    // For a complete list of available options, see:
    //  • https://github.com/christkv/mongodb-core/blob/2.0/lib/topologies/server.js
    //
    // However, note that supported options are explicitly whitelisted below.
    var _clientConfig = {};


    // Validate and parse `meta` (if specified).
    if (!_.isUndefined(inputs.meta)) {
      if (!_.isObject(inputs.meta)) {
        return exits.error('If provided, `meta` must be a dictionary.');
      }

      // Use properties of `meta` directly as Mongo Server config.
      // (note that we're very careful to only stick a property on the client config
      //  if it was not undefined, just in case that matters)
      // http://mongodb.github.io/node-mongodb-native/2.2/reference/connecting/connection-settings/
      var configOptions = [
        // Mongo Server Options:
        // ============================================

        // SSL Options:
        'ssl', 'sslValidate', 'sslCA', 'sslCert', 'sslKey', 'sslPass',

        // Connection Options:
        'poolSize', 'autoReconnect', 'noDelay', 'keepAlive', 'connectTimeoutMS',
        'socketTimeoutMS', 'reconnectTries', 'reconnectInterval',

        // Other Options:
        'ha', 'haInterval', 'replicaSet', 'secondaryAcceptableLatencyMS',
        'acceptableLatencyMS', 'connectWithNoPrimary', 'authSource', 'w',
        'wtimeout', 'j', 'forceServerObjectId', 'serializeFunctions',
        'ignoreUndefined', 'raw', 'promoteLongs', 'bufferMaxEntries',
        'readPreference', 'pkFactory', 'readConcern'

      ];

      _.each(configOptions, function addConfigValue(clientConfKeyName) {
        if (!_.isUndefined(inputs.meta[clientConfKeyName])) {
          _clientConfig[clientConfKeyName] = inputs.meta[clientConfKeyName];
        }
      });


      // In the future, other special properties of `meta` could be used
      // as options for the manager-- e.g. the connection strings of replicas, etc.
    }

    // Validate & parse connection string, pulling out Postgres client config
    // (call `malformed` if invalid).
    //
    // Remember: connection string takes priority over `meta` in the event of a conflict.
    try {
      var parsedConnectionStr = url.parse(inputs.connectionString);

      // Validate that a protocol was found before other pieces
      // (otherwise other parsed info will be very weird and wrong)
      if (!parsedConnectionStr.protocol || parsedConnectionStr.protocol !== 'mongodb:') {
        throw new Error('Protocol (i.e. `mongodb://`) is required in connection string.');
      }

      // Parse user & password
      if (parsedConnectionStr.auth && _.isString(parsedConnectionStr.auth)) {
        var authPieces = parsedConnectionStr.auth.split(/:/);
        if (authPieces[0]) {
          _clientConfig.user = authPieces[0];
        }
        if (authPieces[1]) {
          _clientConfig.password = authPieces[1];
        }
      }
    } catch (_e) {
      _e.message = util.format('Provided value (`%s`) is not a valid Mongodb connection string.', inputs.connectionString) + ' Error details: ' + _e.message;
      return exits.malformed({
        error: _e,
        meta: inputs.meta
      });
    }

    MongoClient.connect(inputs.connectionString, _clientConfig, function connectCb(err, db) {
      if (err) {
        return exits.error({
          error: err,
          meta: inputs.meta
        });
      }

      return exits.success({
        manager: db,
        meta: inputs.meta
      });
    });
  }


};
