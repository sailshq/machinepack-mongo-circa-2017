module.exports = {


  friendlyName: 'Execute Query',


  description: 'Execute a MongoDB query',


  extendedDescription: 'Opens a connection, runs a query, and then closes the connection.',


  cacheable: false,


  sync: false,


  inputs: {

    connectionString: {
      description: 'A connection string to use to connect to MongoDb',
      example: 'mongodb://localhost:27017/myproject',
      required: true
    },

    options: {
      description: 'An optional configuration dictionary to pass in to the connection.',
      extendedDescription: 'See http://mongodb.github.io/node-mongodb-native/2.1/reference/connecting/connection-settings/ for a complete list of options.',
      example: {}
    },

    query: {
      description: 'An RQL query object.',
      example: {},
      required: true
    }

  },


  exits: {

    success: {
      variableName: 'result',
      description: 'The resuts of the query.',
      example: [{}]
    },

    error: {
      description: 'An unexpected error occurred.'
    },

    couldNotConnect: {
      description: 'Could not connect to MongoDB server at specified `connectionUrl`.',
      extendedDescription: 'Make sure the credentials are correct and that the server is running (i.e. to run mongo locally, do `mongod`)'
    },

    malformed: {
      variableName: 'malformed',
      description: 'A malformed query was used and could not be run.'
    }

  },


  fn: function executeQuery(inputs, exits) {
    var Pack = require('../index');

    // Open the connection
    Pack.getConnection({
      connectionString: inputs.connectionString,
      options: inputs.options
    }).exec({
      error: function error(err) {
        return exits.error(err);
      },
      couldNotConnect: function couldNotConnect(err) {
        return exits.couldNotConnect(err);
      },
      success: function success(connection) {
        Pack.sendQuery({
          connection: connection,
          query: inputs.query
        }).exec({
          error: function error(err) {
            // Close the connection
            Pack.releaseConnection({
              release: connection.release
            }).exec({
              error: function error() {
                return exits.error(err);
              },
              success: function success() {
                return exits.error(err);
              }
            });
          },
          malformed: function malformed(err) {
            // Close the connection
            Pack.releaseConnection({
              release: connection.release
            }).exec({
              error: function error() {
                return exits.malfored(err);
              },
              success: function success() {
                return exits.malformed(err);
              }
            });
          },
          success: function success(records) {
            Pack.releaseConnection({
              release: connection.release
            }).exec({
              error: function error(err) {
                return exits.error(err);
              },
              success: function success() {
                return exits.success(records);
              }
            });
          }
        });
      }
    });
  }


};
