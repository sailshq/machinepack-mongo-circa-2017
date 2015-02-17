module.exports = {


  friendlyName: 'Update documents',


  description: 'Modify existing documents in a collection.',


  extendedDescription: '',


  moreInfoUrl: 'http://docs.mongodb.org/manual/reference/method/db.collection.update/#db.collection.update',


  inputs: {

    connectionUrl: {
      description: 'The mongoDB connection URL',
      moreInfoUrl: 'http://docs.mongodb.org/manual/reference/connection-string/',
      defaultsTo: 'mongodb://localhost:27017/machinepack-mongodb-default',
      example: 'mongodb://localhost:27017/machinepack-mongodb-default'
    },

    collection: {
      description: 'The name of the collection whose documents will be updated.',
      example: 'direwolves',
      required: true
    },

    query: {
      description: 'The selection criteria for the update.',
      extendedDescription: 'Uses the same query selectors as in the find() method.',
      moreInfoUrl: 'http://docs.mongodb.org/manual/reference/operator/query/#query-selectors',
      typeclass: 'dictionary',
      required: true
    },

    update: {
      description: 'The modifications to apply.',
      moreInfoUrl: 'http://docs.mongodb.org/manual/reference/method/db.collection.update/#update-parameter',
      typeclass: 'dictionary',
      required: true
    },

    upsert: {
      description: ' If set to true, creates a new document when no document matches the query criteria.',
      extendedDescription: 'The default value is false, which does not insert a new document when no match is found.',
      defaultsTo: false,
      example: true
    },

    multi: {
      description: 'If set to true, updates multiple documents that meet the query criteria.',
      extendedDescription: 'If set to false, updates one document. The default value is false.',
      defaultsTo: false,
      moreInfoUrl: 'http://docs.mongodb.org/manual/reference/method/db.collection.update/#multi-parameter',
      example: true
    },

    writeConcern: {
      description: ' A document expressing the write concern. Omit to use the default write concern.',
      moreInfoUrl: 'http://docs.mongodb.org/manual/reference/method/db.collection.update/#db.collection.update',
      typeclass: 'dictionary'
    },



  },


  defaultExit: 'success',


  exits: {

    error: {
      description: 'Unexpected error occurred.'
    },

    invalidQuery: {
      description: 'Provided query was invalid.',
      moreInfoUrl: 'http://docs.mongodb.org/manual/reference/operator/query/#query-selectors'
    },

    invalidUpdate: {
      description: 'Provided `update` input was invalid.',
      moreInfoUrl: 'http://docs.mongodb.org/manual/reference/method/db.collection.update/#update-parameter'
    },

    couldNotConnect: {
      description: 'Could not connect to MongoDB server at specified `connectionUrl`.',
      extendedDescription: 'Make sure the credentials are correct and that the server is running (i.e. to run mongo locally, do `mongod`)'
    },

    invalidCollection: {
      description: 'Provided `collection` input is not a valid name for a MongoDB collection.',
    },

    success: {
      description: 'Done.',
      moreInfoUrl: 'http://docs.mongodb.org/manual/reference/method/db.collection.update/#writeresults-update',
      example: {
        nMatched: 1,
        nUpserted: 0,
        nModified: 1
      }
    }

  },


  fn: function(inputs, exits) {

    // Bring in a mongo driver
    var MongoClient = require('mongodb').MongoClient;

    var validQuery = (function isQueryValid (query){
      // TODO: validate query -- all we know is that it will be a dictionary (plain ole js object)
      return true;
    })(inputs.query);
    if (!validQuery) {
      return exits.invalidQuery();
    }

    // TODO: validate `update` input

    // TODO: validate other inputs


    // Connection URL
    var url = inputs.connectionUrl || 'mongodb://localhost:27017/machinepack-mongodb-default';

    // Use connect method to connect to the mongo server
    // (every call brings up a new connection for now)
    MongoClient.connect(url, function(err, db) {

      // Failed to connect
      if (err) {
        // TODO: negotiate this error further as needed
        return exits.couldNotConnect(err);
      }

      // Look up collection
      var collection;
      try {
        collection = db.collection(inputs.collection);
      }
      catch (e) {
        // If collection does not exist,
        if (!collection) {
          // Close the db connection
          db.close();
          // and call back w/ an error.
          return exits.invalidCollection();
        }
      }


      // TODO: Prepare the opts object
      var opts = {};
      // if (!_.isUndefined(inputs.upsert)) { opts.upsert = inputs.upsert;} ...
      // etc.

      // Hit mongo w/ the update
      collection.update(inputs.query, inputs.update, opts, function (err, result) {
          // if thisWriteResult.hasWriteConcernError()...
          if (err) {

            // Close the db connection
            db.close();

            // ...then negotiate it and call the appropriate exit
            // e.g.
            // {
            //   "code" : 64,
            //   "errmsg" : "waiting for replication timed out at shard-a"
            // }
            // (usually a good idea to just hit `error` to start with, then add other exits as needed)
            return exits.error(err);
          }

          // Close the db connection
          db.close();

          // Then send back result object from mongo (see `example` in success exit)
          return exits.success(result);

      });

    });



  },

};
