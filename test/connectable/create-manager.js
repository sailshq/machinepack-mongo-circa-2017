var assert = require('assert');
var Pack = require('../../');

describe('Connectable ::', function() {
  describe('Create Manager', function() {
    it('should work without a protocol in the connection string', function(done) {
      Pack.createManager({
        connectionString: 'localhost:27017/mppg'
      })
      .exec(function(err) {
        if (err) {
          return done(err);
        }
        return done();
      });
    });

    it('should not work with an invalid protocol in the connection string', function(done) {
      Pack.createManager({
        connectionString: 'foobar://localhost:27017/mppg'
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
        connectionString: 'mongodb://' + host + ':27017/mppg'
      })
      .exec(function(err, report) {
        if (err) {
          return done(err);
        }

        // Assert that the manager has a pool object
        assert(report.manager);

        return done();
      });
    });
  });
});
