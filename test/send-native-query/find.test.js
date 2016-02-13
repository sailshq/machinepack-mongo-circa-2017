var assert = require('assert');
var _ = require('lodash');
var Pack = require('../../index');
var utils = require('./support');

var MongoClient = require('mongodb').MongoClient;
var host = process.env.MONGO_PORT_27017_TCP_ADDR || 'localhost';
var str = 'mongodb://' + host + ':27017/machinepack';

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
        filter: {},
        sort: {},
        projection: {},
        skip: 0,
        limit: 0
      };

      MongoClient.connect(str, function openConnection(err, db) {
        if (err) {
          return done(err);
        }

        var connection = {
          client: db,
          release: db.close
        };

        // Send the native query and check the results
        Pack.sendNativeQuery({
          connection: connection,
          compiledQuery: query
        }).exec(function(err, records) {
          // Always close the db connection
          db.close();

          assert(!err);
          assert(_.isArray(records));
          assert.equal(records.length, 110);
          done();
        });
      });
    });
  });
});
