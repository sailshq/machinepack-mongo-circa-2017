module.exports = {


  friendlyName: 'Get Connection',


  description: 'Get an active connection to the database.',


  cacheable: false,


  sync: false,


  inputs: {

    connectionString: {
      description: 'A string containing all metadata and credentials necessary for connecting to the database.',
      example: 'mongodb://localhost:27017/myproject',
      required: true
    },

    meta: {
      description: 'An optional configuration dictionary to pass in.',
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
    var MongoClient = require('mongodb').MongoClient;

    // Connection URL
    var url = inputs.connectionString;
    var meta = inputs.meta || {};
    var options = meta.connectionOpts || {};

    // Use connect method to connect to the mongo server.
    MongoClient.connect(url, options, function connect(err, db) {
      if (err) {
        return exits.failedToConnect({
          error: err
        });
      }

      // Build up a connection object that matches the expected exit example
      return exits.success({
        connection: db
      });
    });
  }


};
