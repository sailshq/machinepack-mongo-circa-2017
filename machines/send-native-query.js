module.exports = {


  friendlyName: 'Send Native Query',


  description: 'Send a native query to the database.',


  inputs: {

    connection: {
      friendlyName: 'Connection',
      description: 'An active database connection.',
      extendedDescription: 'The provided database connection instance must still be active.  Only database connection instances created by the `getConnection()` machine in this driver are supported.',
      example: '===',
      required: true
    },

    nativeQuery: {
      description: 'A native query for the database.',
      extendedDescription: 'The provided native query will be coerced to a JSON-serializable value if it isn\'t one already (see [rttc.dehydrate()](https://github.com/node-machine/rttc#dehydratevalue-allownullfalse-dontstringifyfunctionsfalse)). That means any provided Date instances will be converted to timezone-agnostic ISO timestamp strings (i.e. JSON timestamps).',
      whereToGet: {
        description: 'Write a native query for this database, or if this driver supports it, use `compileStatement()` to build a native query from Waterline syntax.',
        extendedDescription: 'This is oftentimes compiled from Waterline query syntax using "Compile statement", however it could also originate from userland code.'
      },
      moreInfoUrl: 'https://docs.mongodb.org/manual/reference/command/#user-commands',
      example: '*',
      required: true
    },

    meta: {
      friendlyName: 'Meta (custom)',
      description: 'Additional stuff to pass to the driver.',
      extendedDescription: 'This is reserved for custom driver-specific extensions.  Please refer to the documentation for the driver you are using for more specific information.',
      example: '==='
    }

  },


  exits: {

    success: {
      description: 'The native query was executed successfully.',
      outputVariableName: 'report',
      outputDescription: 'The `result` property is the result data the database sent back.  The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        result: '===',
        meta: '==='
      }
    },

    queryFailed: {
      description: 'The database returned an error when attempting to execute the native query.',
      outputVariableName: 'report',
      outputDescription: 'The `error` property is a JavaScript Error instance with more details about what went wrong.  The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        error: '===',
        meta: '==='
      }
    },

    badConnection: {
      friendlyName: 'Bad connection',
      description: 'The provided connection is no longer active; or possibly never was.',
      extendedDescription: 'Usually, this means the connection to the database was lost due to a logic error or timing issue in userland code.  In production, this can mean that the database became overwhelemed or was shut off while some business logic was in progress.',
      outputVariableName: 'report',
      outputDescription: 'The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        meta: '==='
      }
    }

  },


  fn: function sendNativeQuery(inputs, exits) {
    var _ = require('lodash');
    var ObjectID = require('mongodb-core').BSON.ObjectID;

    // Grab the server off the connection
    var server = inputs.connection.server;

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
      return exits.queryFailed({
        error: new Error('The nativeQuery input is malformed. It is missing a valid command.'),
        meta: inputs.meta
      });
    }

    // Combine the values to form the namespace.
    // GetConnection stores the databaseName on the client under
    // client.s.options and is generated from the connection string.
    var ns = server.s.options.databaseName + '.' + query[cmd];

    // Map the Mongo standard command to the version of the mongo-core command
    // that is slightly different from the standard version.
    if (query.filter) {
      query.query = query.filter;
    }

    if (query.projection) {
      query.fields = query.projection;
    }

    // If the command is an insert command, ensure that each item has an _id.
    // This way the insert id's can be returned.
    var insertIds = [];
    if (cmd === 'insert') {
      _.each(query.documents, function generateId(doc) {
        if (doc._id) {
          insertIds.push(doc._id);
          return;
        }

        // If no ID exist, generate one.
        doc._id = new ObjectID();
        insertIds.push(doc._id);
      });
    }

    // Build up a new cursor
    var cursor = server.cursor(ns, query, {});

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

          if (doc == null) {
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
        return exits.error({
          error: err,
          meta: inputs.meta
        });
      }

      // Check for writeErrors
      if (docs.length === 1 && _.first(docs).writeErrors) {
        return exits.queryFailed({
          error: _.first(docs).writeErrors,
          meta: inputs.meta
        });
      }

      // If this was an insert command, add the insertIds to the results.
      if (cmd === 'insert') {
        var record = _.first(docs);
        record.insertIds = insertIds;
      }

      exits.success({
        result: docs,
        meta: inputs.meta
      });
    });
  }

};
