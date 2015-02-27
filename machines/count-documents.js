module.exports = {


  friendlyName: 'Count documents',


  description: 'Count the documents in this collection which match the specified criteria.',


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
      extendedDescription: 'Uses the same query selectors as in the find() method.',
      moreInfoUrl: 'http://docs.mongodb.org/manual/reference/operator/query/#query-selectors',
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
      description: 'Returns the number of documents which match the specified criteria.',
      example: 2385
    },

  },


  fn: function (inputs,exits) {
    return exits.error('TODO');
  },



};
