module.exports = {


  friendlyName: 'Get Connection',


  description: 'Get an active connection to a MongoDB database.',


  cacheable: false,


  sync: false,


  inputs: {

    connectionString: {
      description: 'A string containing all metadata and credentials necessary for connecting to the database.',
      moreInfoUrl: 'https://docs.mongodb.org/manual/reference/connection-string/#connection-string-options',
      example: 'mongodb://localhost:27017/myproject',
      required: true
    },

    meta: {
      friendlyName: 'Meta (custom)',
      description: 'Additional stuff to pass to the adapter. Use the `connectionOpts` key to pass additional connection options to the connection.',
      extendedDescription: 'See http://mongodb.github.io/node-mongodb-native/2.1/reference/connecting/connection-settings/ for a complete list of options.',
      example: '==='
    }

  },


  exits: {

    success: {
      description: 'A connection was successfully acquired.',
      extendedDescription: 'This connection should be eventually released.  Otherwise, it may time out.  It is not a good idea to rely on database connections timing out-- be sure to release this connection when finished with it!',
      outputVariableName: 'report',
      outputDescription: 'The `connection` property is an active connection to the database.  The `meta` property is reserved for custom adapter-specific extensions.',
      example: {
        connection: '===',
        meta: '==='
      }
    },

    malformed: {
      description: 'The provided connection string is malformed (the adapter DID NOT ATTEMPT to acquire a connection).',
      outputVariableName: 'report',
      outputDescription: 'The `error` property is a JavaScript Error instance explaining that (and preferably "why") the provided connection string is invalid.  The `meta` property is reserved for custom adapter-specific extensions.',
      example: {
        error: '===',
        meta: '==='
      }
    },

    failedToConnect: {
      description: 'Could not acquire a connection to the database using the specified connection string.',
      extendedDescription: 'This might mean any of the following:\n' +
      ' + the credentials encoded in the connection string are incorrect\n' +
      ' + there is no database server running at the provided host (i.e. even if it is just that the database process needs to be started)\n' +
      ' + there is no software "database" with the specified name running on the server\n' +
      ' + the provided connection string does not have necessary access rights for the specified software "database"\n' +
      ' + this Node.js process could not connect to the database, perhaps because of firewall/proxy settings\n' +
      ' + any other miscellaneous connection error',
      outputVariableName: 'report',
      outputDescription: 'The `error` property is a JavaScript Error instance explaining that a connection could not be made.  The `meta` property is reserved for custom adapter-specific extensions.',
      example: {
        error: '===',
        meta: '==='
      }
    }

  },


  fn: function getConnection(inputs, exits) {
    var Server = require('mongodb-core').Server;
    var url = require('url');
    var _ = require('lodash');

    // Connection URL
    var connectionString = inputs.connectionString;
    var meta = inputs.meta || {};
    var options = meta.connectionOpts || {};
    var parsedUrl = url.parse(connectionString);

    // Set user options
    var connectionOptions = _.defaults({
      reconnect: true,
      reconnectTries: 30,
      reconnectInterval: 1000,
      emitError: false,
      size: 10,
      keepAlive: true,
      keepAliveInitialDelay: 0,
      noDelay: 0,
      connectionTimeout: 0,
      socketTimeout: 0,
      ssl: false,
      rejectUnauthorized: true,
      promoteLongs: true
    }, options);

    // Add in the HOST and PORT from the connection string
    connectionOptions.host = parsedUrl.hostname;
    connectionOptions.port = parsedUrl.port;
    connectionOptions.databaseName = parsedUrl.pathname.replace('/', '');

    // Build a new server instance
    var server = new Server(connectionOptions);

    //  ╔═╗╦  ╦╔═╗╔╗╔╔╦╗  ╦ ╦╔═╗╔╗╔╔╦╗╦  ╔═╗╦═╗╔═╗
    //  ║╣ ╚╗╔╝║╣ ║║║ ║   ╠═╣╠═╣║║║ ║║║  ║╣ ╠╦╝╚═╗
    //  ╚═╝ ╚╝ ╚═╝╝╚╝ ╩   ╩ ╩╩ ╩╝╚╝═╩╝╩═╝╚═╝╩╚═╚═╝

    // Wait for the connection event
    server.on('connect', function connect(server) {
      successCallback(server);
    });

    server.on('close', function close(server) {
      server.destroy();
      failedToConnectCallback();
    });

    server.on('error', function error(server) {
      server.destroy();
      errorCallback();
    });

    server.on('timeout', function timeout(server) {
      server.destroy();
      failedToConnectCallback();
    });

    server.on('parseError', function parseError(server) {
      server.destroy();
      malformedCallback();
    });

    // Start connecting
    server.connect();

    //  ╔═╗╦  ╦╔═╗╔╗╔╔╦╗  ╔═╗╔═╗╦  ╦  ╔╗ ╔═╗╔═╗╦╔═╔═╗
    //  ║╣ ╚╗╔╝║╣ ║║║ ║   ║  ╠═╣║  ║  ╠╩╗╠═╣║  ╠╩╗╚═╗
    //  ╚═╝ ╚╝ ╚═╝╝╚╝ ╩   ╚═╝╩ ╩╩═╝╩═╝╚═╝╩ ╩╚═╝╩ ╩╚═╝

    var errorCallback = function errorCallback() {
      return exits.error();
    };

    var failedToConnectCallback = function failedToConnectCallback() {
      return exits.failedToConnect();
    };

    var malformedCallback = function malformedCallback() {
      return exits.malformed();
    };

    var successCallback = function successCallback(server) {
      return exits.success({
        connection: server
      });
    };
  }


};
