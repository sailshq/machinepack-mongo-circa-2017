module.exports = {


  friendlyName: 'List collections',


  description: 'List the names of collections in the specified Mongo database.',


  extendedDescription: '',


  inputs: {

    connectionUrl: {
      description: 'The mongoDB connection URL',
      moreInfoUrl: 'http://docs.mongodb.org/manual/reference/connection-string/',
      defaultsTo: 'mongodb://localhost:27017/machinepack-mongodb-default',
      example: 'mongodb://localhost:27017/machinepack-mongodb-default'
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

    success: {
      description: 'Returns an array of collection names.',
      example: [
        'direwolves'
      ]
    },

  },


  fn: function (inputs,exits) {
    return exits.error('TODO');
  },



};
