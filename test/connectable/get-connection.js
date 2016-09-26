var assert = require('assert');
var Server = require('mongodb-core').Server;
var Pack = require('../../');

describe('Connectable ::', function() {
  describe('Get Connection', function() {
    var manager;

    // Create a manager
    before(function(done) {
      // Needed to dynamically get the host using the docker container
      var host = process.env.MONGO_1_PORT_27017_TCP_ADDR || 'localhost';

      Pack.createManager({
        connectionString: 'mongodb://' + host + ':27017'
      })
      .exec(function(err, report) {
        if (err) {
          return done(err);
        }

        manager = report.manager;
        return done();
      });
    });

    it('should successfully return a Mongo Server instance', function(done) {
      Pack.getConnection({
        manager: manager
      })
      .exec(function(err, report) {
        if (err) {
          return done(err);
        }

        // Assert that the report has a server object
        assert(report.connection.server);

        // Assert that a Mongo-Core Server is returned
        assert(report.connection.server instanceof Server);

        return done();
      });
    });
  });
});
