module.exports = {


  friendlyName: 'Release Connection',


  description: 'Release an open connection.',


  cacheable: false,


  sync: false,


  inputs: {

    release: {
      description: 'The release value created when a connection was opened.',
      example: '===',
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


  fn: function releaseConnection(inputs, exits) {
    inputs.release();
    return exits.success();
  }

};
