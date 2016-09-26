var assert = require('assert');
var _ = require('lodash');
var Pack = require('../../');

describe('Queryable ::', function() {
  describe('Parse Native Query Result', function() {
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

    it('should normalize SELECT query results from a native query', function(done) {
      Pack.sendNativeQuery({
        connection: connection,
        nativeQuery: {
          find: 'users',
          filter: {},
          sort: {},
          projection: {},
          skip: 0,
          limit: 0
        }
      })
      .exec(function(err, report) {
        if (err) {
          return done(err);
        }

        var result = report.result;

        Pack.parseNativeQueryResult({
          queryType: 'select',
          nativeQueryResult: result
        })
        .exec(function(err, report) {
          if (err) {
            return done(err);
          }

          assert(report.result);
          assert(_.isArray(report.result));
          assert.equal(report.result.length, 0);

          return done();
        });
      });
    });

    it('should normalize INSERT query results from a native query', function(done) {
      Pack.sendNativeQuery({
        connection: connection,
        nativeQuery: {
          insert: 'users',
          documents: [
            {
              name: 'hugo'
            }
          ]
        }
      })
      .exec(function(err, report) {
        if (err) {
          return done(err);
        }

        var result = report.result;

        Pack.parseNativeQueryResult({
          queryType: 'insert',
          nativeQueryResult: result
        })
        .exec(function(err, report) {
          if (err) {
            return done(err);
          }

          assert(report.result);
          assert(report.result.inserted);

          // We don't know what the ID will be so just check it's a string
          assert(_.isString(report.result.inserted));

          return done();
        });
      });
    });

    it('should normalize UPDATE query results from a native query', function(done) {
      Pack.sendNativeQuery({
        connection: connection,
        nativeQuery: {
          insert: 'users',
          documents: [
            {
              name: 'hugo'
            }
          ]
        }
      })
      .exec(function(err, report) {
        if (err) {
          return done(err);
        }

        Pack.sendNativeQuery({
          connection: connection,
          nativeQuery: {
            update: 'users',
            updates: [
              {
                q: {
                  _id: report.result[0].insertIds[0]
                },
                u: {
                  '$set': {
                    name: 'george'
                  }
                }
              }
            ]
          }
        })
        .exec(function(err, report) {
          if (err) {
            return done(err);
          }

          var result = report.result;

          Pack.parseNativeQueryResult({
            queryType: 'update',
            nativeQueryResult: result
          })
          .exec(function(err, report) {
            if (err) {
              return done(err);
            }

            assert(report.result);
            assert(report.result.numRecordsUpdated);
            assert.equal(report.result.numRecordsUpdated, 1);

            return done();
          });
        });
      });
    });

    it('should normalize DELETE query results from a native query', function(done) {
      Pack.sendNativeQuery({
        connection: connection,
        nativeQuery: {
          insert: 'users',
          documents: [
            {
              name: 'Sally'
            }
          ]
        }
      })
      .exec(function(err, report) {
        if (err) {
          return done(err);
        }

        // Ensure that the record inserted ok
        assert.equal(_.first(report.result).n, 1);

        Pack.sendNativeQuery({
          connection: connection,
          nativeQuery: {
            delete: 'users',
            deletes: [
              {
                q: {
                  name: 'Sally'
                },
                limit: 0
              }
            ]
          }
        })
        .exec(function(err, report) {
          if (err) {
            return done(err);
          }

          var result = report.result;

          Pack.parseNativeQueryResult({
            queryType: 'delete',
            nativeQueryResult: result
          })
          .exec(function(err, report) {
            if (err) {
              return done(err);
            }

            assert(report.result);
            assert(report.result.numRecordsDeleted);
            assert.equal(report.result.numRecordsDeleted, 1);

            return done();
          });
        });
      });
    });
  });
});
