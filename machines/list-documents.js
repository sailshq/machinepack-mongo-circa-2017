module.exports = {


  friendlyName: 'List documents',


  description: 'List documents in this Mongo collection which match the specified criteria.',


  extendedDescription: '',


  inputs: {

    connectionUrl: {
      description: 'The mongoDB connection URL',
      moreInfoUrl: 'http://docs.mongodb.org/manual/reference/connection-string/',
      defaultsTo: 'mongodb://localhost:27017/machinepack-mongodb-default',
      example: 'mongodb://localhost:27017/machinepack-mongodb-default'
    },

    collection: {
      description: 'The name of the collection.',
      example: 'direwolves',
      required: true
    },

    query: {
      description: 'The selection criteria (like the WHERE clause)',
      extendedDescription: 'Standard query selectors from the Mongo find() method.',
      moreInfoUrl: 'http://docs.mongodb.org/manual/reference/operator/query/#query-selectors',
      typeclass: 'dictionary',
      required: true
    },

    limit: {
      description: 'If specified, limits number of documents returned in the query (useful for pagination)',
      moreInfoUrl: 'http://mongodb.github.io/node-mongodb-native/api-generated/collection.html#find',
      example: 30
    },

    skip: {
      description: 'If specified, skips N documents ahead in the query (useful for pagination)',
      moreInfoUrl: 'http://mongodb.github.io/node-mongodb-native/api-generated/collection.html#find',
      example: 30
    },

    sort: {
      description: 'If specified, the documents coming back from the query will be sorted according to this dictionary.',
      typeclass: 'dictionary',
      moreInfoUrl: 'http://mongodb.github.io/node-mongodb-native/api-generated/collection.html#find'
    },

    schema: {
      description: 'An example indicating what each returned document should look like.',
      extendedDescription: 'This is used to determine the `fields` (i.e. projection) passed in w/ the query.',
      typeclass: 'dictionary',
      required: true
    }

  },


  defaultExit: 'success',


  exits: {

    error: {
      description: 'Unexpected error occurred.',
    },

    couldNotConnect: {
      description: 'Could not connect to MongoDB server at specified `connectionUrl`.',
      extendedDescription: 'Make sure the credentials are correct and that the server is running (i.e. to run mongo locally, do `mongod`)'
    },

    invalidCollection: {
      description: 'Provided `collection` input is not a valid name for a MongoDB collection.',
    },

    success: {
      description: 'Returns an array of documents.',
      getExample: function (inputs){
        return inputs.schema;
      }
    },

  },


  fn: function (inputs,exits) {


    // Bring in a mongo driver
    var MongoClient = require('mongodb').MongoClient;

    var validQuery = (function isQueryValid (query){
      // TODO: validate query -- all we know is that it will be a dictionary (plain ole js object)
      return true;
    })(inputs.query);
    if (!validQuery) {
      return exits.invalidQuery();
    }

    // TODO: validate inputs


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

      // Hit mongo w/ the find
      collection.find(inputs.query, /* ... todo: al the things */ opts, function (err, result) {
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
