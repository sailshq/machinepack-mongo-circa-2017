module.exports = {


  friendlyName: 'Send Native Query',


  description: 'Send a compiled query to the MongoDB collection.',


  cacheable: false,


  sync: false,


  inputs: {

    connection: {
      description: 'A MongoDB client to use for running the query.',
      example: '===',
      required: true
    },

    compiledQuery: {
      description: 'A compiled query object.',
      example: {},
      required: true
    }

  },


  exits: {

    success: {
      variableName: 'result',
      description: 'Done.'
    },

    error: {
      variableName: 'error',
      description: 'An unexpected error occured.'
    }

  },


  fn: function sendNativeQuery(inputs, exits) {
    var _ = require('lodash');

    // Grab the client off the connection
    var client = inputs.connection.client;

    // Grab the query object from the inputs to make it easier to work with
    var query = inputs.compiledQuery;

    // Available commands to run
    var commands = [
      'find',
      'distinct',
      'aggregate',
      'insert',
      'update',
      'delete'
    ];

    // Build a namespace that includes the dbName.cmd
    var cmd;
    _.each(query, function findCmd(val, key) {
      var idx = _.indexOf(commands, key);
      if (idx < 0) {
        return;
      }

      // If the key is a command, set it
      cmd = key;
    });

    // If there isn't a command to run, this is a malformed query
    if (!cmd) {
      return exits.malformed();
    }

    var ns = client.s.databaseName + '.' + query[cmd];
    var _cursor = client.s.topology.cursor(ns, query, {});

    // Hold cursor state
    var s = {};

    // Build a toArray function that works the same as the Mongo Shell `toArray`
    // function. It pages through the cursor until there are no more results.
    var toArray = function toArray(cb) {
      // Hold collected items
      var items = [];

      // Reset cursor
      _cursor.rewind();
      s.state = 0;

      // Fetch all the documents
      var fetchDocs = function fetchDocs() {
        _cursor.next(function next(err, doc) {
          if (err) {
            return cb(err);
          }

          if (doc == null) {
            s.state = 2;
            return cb(null, items);
          }

          // Add doc to items
          items.push(doc);

          // Attempt a fetch
          fetchDocs();
        });
      };

      fetchDocs();
    };

    // Run the cursor
    toArray(function toArray(err, records) {
      if (err) {
        return exits.error(err);
      }

      return exits.success(records);
    });
  }

};
