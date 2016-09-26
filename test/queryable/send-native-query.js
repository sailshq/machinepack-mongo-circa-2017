var assert = require('assert');
var _ = require('lodash');
var Pack = require('../../');

describe('Queryable ::', function() {
  describe('Send Native Query', function() {
    var manager;
    var connection;

    // Create a manager and connection
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

        // Store the manager
        manager = report.manager;

        Pack.getConnection({
          manager: manager
        })
        .exec(function(err, report) {
          if (err) {
            return done(err);
          }

          // Store the connection
          connection = report.connection;
          return done();
        });
      });
    });

    // Afterwards release the connection
    after(function(done) {
      Pack.releaseConnection({
        connection: connection
      }).exec(done);
    });

    it('should run a native query and return the reports', function(done) {
      var query = {
        find: 'users',
        filter: {},
        sort: {},
        projection: {},
        skip: 0,
        limit: 0
      };

      Pack.sendNativeQuery({
        connection: connection,
        nativeQuery: query
      })
      .exec(function(err, report) {
        if (err) {
          return done(err);
        }

        assert(_.isArray(report.result));

        return done();
      });
    });

    describe('with internal cursor', function() {
      // Before the test insert some records.
      // The default mongo cursor batch size is 101, so insert 110 records to ensure
      // the cursor is functioning properly
      before(function(done) {
        // Default mongo cursor batch size is 101, so insert 110 records to ensure
        // the cursor is functioning properly
        var records = [];
        for (var i = 1; i <= 110; i++) {
          records.push({ name: 'user_' + i });
        }

        Pack.sendNativeQuery({
          connection: connection,
          nativeQuery: {
            insert: 'users',
            documents: records
          }
        })
        .exec(done);
      });

      after(function(done) {
        Pack.sendNativeQuery({
          connection: connection,
          nativeQuery: {
            drop: 'users',
          }
        })
        .exec(done);
      });

      it('should query the data using a cursor', function(done) {
        var query = {
          find: 'users',
          filter: {},
          sort: {},
          projection: {},
          skip: 0,
          limit: 0
        };

        Pack.sendNativeQuery({
          connection: connection,
          nativeQuery: query
        }).
        exec(function(err, report) {
          assert(!err);
          assert(_.isArray(report.result));
          assert.equal(report.result.length, 110);

          return done();
        });
      });
    });
  });
});
