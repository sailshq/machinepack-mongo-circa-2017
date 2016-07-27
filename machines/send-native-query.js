module.exports = {
  friendlyName: 'Send Native Query',
  description: 'Send a native query to the database.',
  cacheable: false,
  sync: false,
  inputs: {
    connection: {
      friendlyName: 'Connection',
      description: 'An active database connection.',
      extendedDescription: 'The provided database connection instance must still be active.  Only database connection instances created by the `getConnection()` machine in this adapter are supported.',
      example: '===',
      required: true
    },
    nativeQuery: {
      description: 'A native query for the database.',
      extendedDescription: 'This is oftentimes compiled from Waterline query syntax using "Compile statement", however it could also originate from userland code.',
      moreInfoUrl: 'https://docs.mongodb.org/manual/reference/command/#user-commands',
      example: '*',
      required: true
    },
    meta: {
      friendlyName: 'Meta (custom)',
      description: 'Additional stuff to pass to the adapter.',
      extendedDescription: 'This is reserved for custom adapter-specific extensions.  Please refer to the documentation for the adapter you are using for more specific information.',
      example: '==='
    }

  },
  exits: {
    success: {
      description: 'The native query was executed successfully.',
      outputVariableName: 'report',
      outputDescription: 'The `result` property is the result data the database sent back.  The `meta` property is reserved for custom adapter-specific extensions.',
      example: {
        result: '*',
        meta: '==='
      }
    },
    badConnection: {
      friendlyName: 'Bad connection',
      description: 'The provided connection is no longer active; or possibly never was.',
      extendedDescription: 'Usually, this means the connection to the database was lost due to a logic error or timing issue in userland code.  In production, this can mean that the database became overwhelemed or was shut off while some business logic was in progress.',
      outputVariableName: 'report',
      outputDescription: 'The `error` property is a JavaScript Error instance containing the raw error from the database.  The `meta` property is reserved for custom adapter-specific extensions.',
      example: {
        error: '===',
        meta: '==='
      }
    }
  },
  fn: function sendNativeQuery(inputs, exits) {
    var _ = require('lodash');

    // Grab the client from the connection
    var client = inputs.connection;

    // Grab the query object from the inputs to make it easier to work with
    var query = inputs.nativeQuery;

    // Available commands to run
    var commands = [
      'find',
      'distinct',
      'aggregate',
      'insert',
      'update',
      'delete',
      'listCollections',
      'create',
      'createIndexes',
      'drop'
    ];

    // Build a namespace that includes the dbName.collectionName
    // The collection name comes from the command being run.
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
      return exits.error(new Error('The nativeQuery input is malformed. It is missing a valid command.'));
    }

    // Combine the values to form the namespace.
    // GetConnection stores the databaseName on the client under
    // client.s.options and is generated from the connection string.
    var ns = client.s.options.databaseName + '.' + query[cmd];

    // Map the Mongo standard command to the version of the mongo-core command
    // that is slightly different from the standard version.
    if (query.filter) {
      query.query = query.filter;
    }

    if (query.projection) {
      query.fields = query.projection;
    }

    // Build up a new cursor
    var cursor = client.cursor(ns, query, { });

    // Build a toArray function that works the same as the Mongo Shell `toArray`
    // function. It pages through the cursor until there are no more results.
    var toArray = function toArray(cb) {
      // Hold collected items
      var items = [];

      // Reset cursor
      cursor.rewind();

      // Fetch all the documents
      var fetchDocs = function fetchDocs() {
        cursor.next(function next(err, doc) {
          if (err) {
            return cb(err);
          }

          if (doc === null) {
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

    // Run through the cursor
    toArray(function toArray(err, docs) {
      if (err) {
        return exits.error(err);
      }

      exits.success({
        result: docs
      });
    });
  }

};
