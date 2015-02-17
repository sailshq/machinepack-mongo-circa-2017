module.exports = {


  friendlyName: 'Update documents',


  description: 'Modify existing documents in a collection.',


  extendedDescription: '',


  moreInfoUrl: 'http://docs.mongodb.org/manual/reference/method/db.collection.update/#db.collection.update',


  inputs: {

  },


  defaultExit: 'success',


  exits: {

    error: {
      description: 'Unexpected error occurred.'
    },

    success: {
      description: 'Done.'
    }

  },


  fn: function(inputs, exits) {
    return exits.success();
  },

};
