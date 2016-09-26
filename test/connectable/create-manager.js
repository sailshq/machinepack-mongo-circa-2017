var assert = require('assert');
var Server = require('mongodb-core').Server;
var Pack = require('../../');

describe('Connectable ::', function() {
  describe('Create Manager', function() {
    it('should validate the connection string has a protocol', function(done) {
      Pack.createManager({
        connectionString: 'localhost:27017/mppg'
      })
      .exec(function(err) {
        assert(err);
        assert.equal(err.exit, 'malformed');

        return done();
      });
    });

    it('should successfully return a Mongo Server instance', function(done) {
      // Needed to dynamically get the host using the docker container
      var host = process.env.MONGO_1_PORT_27017_TCP_ADDR || 'localhost';

      Pack.createManager({
        connectionString: 'mongodb://' + host + ':27017'
      })
      .exec(function(err, report) {
        if (err) {
          return done(err);
        }

        // Assert that the manager has a pool object
        assert(report.manager.server);

        // Assert that a Mongo-Core Server is returned
        assert(report.manager.server instanceof Server);

        return done();
      });
    });
  });
});
