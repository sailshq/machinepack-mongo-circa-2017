var assert = require('assert');
var Pack = require('../../');

describe('Connectable ::', function() {
  describe('Destroy Manager', function() {
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


    it('should successfully destroy the manager', function(done) {
      Pack.destroyManager({
        manager: manager
      })
      .exec(function(err) {
        assert(!err);
        return done();
      });
    });
  });
});
