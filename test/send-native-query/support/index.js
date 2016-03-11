/**
 * Setup a mongo collection and seed it for the tests. Afterwards destroy the
 * collection that has been created.
 */

var Server = require('mongodb-core').Server;
var host = process.env.MONGO_PORT_27017_TCP_ADDR || 'localhost';
var port = process.env.MONGO_PORT_27017_TCP_PORT || '27017';
module.exports = {
  // Seed the collection with records
  seed: function seed(done) {
    // Default mongo cursor batch size is 101, so insert 110 records to ensure
    // the cursor is functioning properly
    var records = [];
    for (var i = 1; i <= 110; i++) {
      records.push({ name: 'user_' + i });
    }
    var server = new Server({ host: host, port: port, databaseName: 'machinepack' });
    try {
      // Wait for the connection event
      server.on('connect', function(server) {
        server.insert('machinepack.users', records, { }, function(err) {
          if (err) {
            return done(err);
          }
          server.destroy();
          return done();
        });
      });
    } catch (err) {
      return done(err);
    }
    server.connect();
  },
  // Destroy the collection
  cleanup: function cleanup(done) {
    var server = new Server({ host: host, port: port, databaseName: 'machinepack' });
    try {
      // Wait for the connection event
      server.on('connect', function(server) {
        server.command('machinepack.$cmd', { drop: 'users' }, function(err) {
          if (err) {
            return done(err);
          }
          server.destroy();
          return done();
        });
      });
      return done();
    } catch (err) {
      return done(err);
    }
    server.connect();
  }
};
