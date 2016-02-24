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
    },

    notUnique: {
      friendlyName: 'Not unique',
      description: 'The provided query failed because it would violate one or more uniqueness constraints.',
      outputVariableName: 'report',
      outputDescription: 'The `columns` property is an array containing the names of columns with uniquness constraint violations. The `error` property is a JavaScript Error instance containing the raw error from the database.  The `meta` property is reserved for custom adapter-specific extensions.',
      example: {
        // https://github.com/balderdashy/sails-mongo/blob/0656ff3471339b8bae299e6fd8b7b379f7a34c15/lib/utils.js#L182
        columns: ['email_address'],
        error: '===',
        meta: '==='
      }
    }

  },


  fn: function sendNativeQuery(inputs, exits) {
    var _ = require('lodash');

    // Grab the client off the connection
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
      return exits.error('The nativeQuery input is malformed. It is missing a valid command.');
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

    // Negotiate an error message
    // Currently just handles notUnique
    var negotiateError = function negotiateError(err) {
      // MongoDB duplicate key error code
      if (err.code !== 11000) {
        return err;
      }

      // Example errmsg: `E11000 duplicate key error index: db_name.model_name.$attribute_name_1 dup key: { : "value" }`
      var matches = /E11000 duplicate key error index: .*?\..*?\.\$(.*?)_\d+\s+dup key: { : (.*) }$/.exec(err.errmsg);
      if (!matches) {
        // Example errmsg: E11000 duplicate key error collection: db_name.model_name index: attribute_name_1 dup key: { : "value" }
        matches = /E11000 duplicate key error collection: .*?\..*? index: (.*?)_\d+\s+dup key: { : (.*) }$/.exec(err.errmsg);
        if (!matches) {
          // We cannot parse error message, return original error
          return err;
        }
      }

      // name of index (without _[digits] at the end)
      var fieldName = matches[1];
      return exits.notUnique({
        columns: [fieldName],
        error: err
      });
    };

    // Run the cursor
    toArray(function toArray(err, records) {
      if (err) {
        negotiateError(err);
        return exits.error(err);
      }

      return exits.success({
        result: records
      });
    });
  }

};
