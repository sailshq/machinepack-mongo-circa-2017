var assert = require('assert');
var _ = require('lodash');
var Pack = require('../../index');
var utils = require('./support');

var Server = require('mongodb-core').Server;
var host = process.env.MONGO_PORT_27017_TCP_ADDR || 'localhost';
var port = process.env.MONGO_PORT_27017_TCP_PORT || '27017';

describe('Send Native Query :: ', function() {
  describe('Find :: ', function() {
    // Seed and cleanup
    before(function(done) {
      utils.seed(done);
    });

    after(function(done) {
      utils.cleanup(done);
    });

    it('should return all the records using the cursor', function(done) {
      var query = {
        find: 'users',
        filter: { },
        sort: { },
        projection: { },
        skip: 0,
        limit: 0
      };
      var server = new Server({ host: host, port: port, databaseName: 'machinepack' });
      try {
        // Wait for the connection event
        server.on('connect', function(server) {
          // Send the native query and check the results
          Pack.sendNativeQuery({
            connection: server,
            nativeQuery: query
          }).exec(function(err, response) {
            // Always close the db connection
            server.destroy();

            assert(!err);
            assert(_.isArray(response.result));
            assert.equal(response.result.length, 110);
            return done();
          });
        });
      } catch (err) {
        return done(err);
      }
      server.connect();
    });
  });
});
