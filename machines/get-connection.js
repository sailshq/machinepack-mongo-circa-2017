module.exports = {


  friendlyName: 'Get Connection',


  description: 'Get an active MongoDB connection',


  cacheable: false,


  sync: false,


  inputs: {

    connectionString: {
      description: 'A connection string to use to connect to MongoDb',
      example: 'mongodb://localhost:27017/myproject',
      required: true
    },

    options: {
      description: 'An optional configuration dictionary to pass in.',
      extendedDescription: 'See http://mongodb.github.io/node-mongodb-native/2.1/reference/connecting/connection-settings/ for a complete list of options.',
      example: {}
    }

  },


  exits: {

    success: {
      variableName: 'result',
      description: 'An open MongoDB connection',
      example: {
        client: '===',
        release: '==='
      }
    },

    error: {
      description: 'An unexpected error occurred.'
    },

    couldNotConnect: {
      description: 'Could not connect to MongoDB server at specified `connectionUrl`.',
      extendedDescription: 'Make sure the credentials are correct and that the server is running (i.e. to run mongo locally, do `mongod`)'
    }

  },


  fn: function getConnection(inputs, exits) {
    var MongoClient = require('mongodb').MongoClient;

    // Connection URL
    var url = inputs.connectionString;
    var options = inputs.options || {};

    // Use connect method to connect to the mongo server.
    MongoClient.connect(url, options, function connect(err, db) {
      if (err) {
        return exits.couldNotConnect(err);
      }

      // Build up a connection object that matches the expected exit example
      var connection = {
        client: db,
        release: db.close
      };

      return exits.success(connection);
    });
  }


};
