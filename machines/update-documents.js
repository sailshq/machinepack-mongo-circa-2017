module.exports = {


  friendlyName: 'Update documents',


  description: 'Modify existing documents in a collection.',


  extendedDescription: '',


  moreInfoUrl: 'http://docs.mongodb.org/manual/reference/method/db.collection.update/#db.collection.update',


  inputs: {

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

    var validQuery = (function isQueryValid (query){
      // TODO: validate query -- all we know is that it will be a dictionary (plain ole js object)
      return true;
    })(inputs.query);
    if (!validQuery) {
      return exits.invalidQuery();
    }

    // TODO: hit mongo (every call brings up a new connection for now)

    // TODO: if thisWriteResult.hasWriteConcernError(), then negotiate it and call the appropriate exit
    // e.g.
    // {
    //   "code" : 64,
    //   "errmsg" : "waiting for replication timed out at shard-a"
    // }
    //
    // (usually a good idea to just hit `error` to start with, then add other exits as needed)

    // send back results object from mongo (see `example` in success exit)
    return exits.success();
  },

};
