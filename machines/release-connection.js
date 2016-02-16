module.exports = {


  friendlyName: 'Release Connection',


  description: 'Release an active database connection.',


  extendedDescription: 'Releases a connection back into the connection pool.',


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

    meta: {
      friendlyName: 'Meta (custom)',
      description: 'Additional stuff to pass to the adapter.',
      extendedDescription: 'This is reserved for custom adapter-specific extensions.  Please refer to the documentation for the adapter you are using for more specific information.',
      example: '==='
    }

  },


  exits: {

    success: {
      description: 'The connection was released and is no longer active.',
      extendedDescription: 'The provided connection may no longer be used for any subsequent queries.',
      outputVariableName: 'report',
      outputDescription: 'The `meta` property is reserved for custom adapter-specific extensions.',
      example: {
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


  fn: function releaseConnection(inputs, exits) {
    inputs.connection.close();
    return exits.success();
  }

};
