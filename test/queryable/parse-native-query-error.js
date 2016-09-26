var assert = require('assert');
var _ = require('lodash');
var Pack = require('../../');

describe('Queryable ::', function() {
  describe('Parse Native Query Error', function() {
    var manager;
    var connection;

    // Create a manager and connection
    before(function(done) {
      // Needed to dynamically get the host using the docker container
      var host = process.env.MONGO_1_PORT_27017_TCP_ADDR || 'localhost';

      Pack.createManager({
        connectionString: 'mongodb://' + host + ':27017/mppg'
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

          // Create a collection and add a unique index to the name field.
          var query = {
            createIndexes: 'users',
            indexes: [
              {
                key: {
                  'name': 1
                },
                name: 'name',
                unique: true,
                sparse: true
              }
            ]
          };

          Pack.sendNativeQuery({
            connection: connection,
            nativeQuery: query
          })
          .exec(done);
        });
      });
    });

    // Afterwards destroy the test table and release the connection
    after(function(done) {
      Pack.sendNativeQuery({
        connection: connection,
        nativeQuery: {
          drop: 'users',
        }
      })
      .exec(done);
    });

    it('should normalize UNIQUE constraint errors', function(done) {
      // Insert two records with identical names
      Pack.sendNativeQuery({
        connection: connection,
        nativeQuery: {
          insert: 'users',
          documents: [
            { name: 'batman' },
            { name: 'batman' }
          ]
        }
      })
      .exec(function(err) {
        assert(err);
        assert.equal(err.exit, 'queryFailed');

        Pack.parseNativeQueryError({
          nativeQueryError: err.output.error
        })
        .exec(function(err, report) {
          if (err) {
            return done(err);
          }

          assert(report.footprint);
          assert(report.footprint.identity);
          assert.equal(report.footprint.identity, 'notUnique');
          assert(_.isArray(report.footprint.keys));
          assert.equal(report.footprint.keys.length, 1);
          assert.equal(_.first(report.footprint.keys), 'name');

          return done();
        });
      });
    });
  });
});
