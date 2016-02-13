/**
 * Setup a mongo collection and seed it for the tests. Afterwards destroy the
 * collection that has been created.
 */

var MongoClient = require('mongodb').MongoClient;
var host = process.env.MONGO_PORT_27017_TCP_ADDR || 'localhost';
var str = 'mongodb://' + host + ':27017/machinepack';

module.exports = {
  // Seed the collection with records
  seed: function seed(done) {
    // Default mongo cursor batch size is 101, so insert 110 records to ensure
    // the cursor is functioning properly
    var records = [];
    for (var i = 1; i <= 110; i++) {
      records.push({ name: 'user_' + i });
    }

    MongoClient.connect(str, function openConnection(err, db) {
      if (err) {
        return done(err);
      }

      db.collection('users').insertMany(records, function insertRecords(err) {
        db.close();
        if (err) {
          return done(err);
        }

        return done();
      });
    });
  },

  // Destroy the collection
  cleanup: function cleanup(done) {
    MongoClient.connect(str, function openConnection(err, db) {
      if (err) {
        return done(err);
      }

      db.collection('users').drop(function(err) {
        db.close();
        if (err) {
          return done(err);
        }

        return done();
      });
    });
  }
};
