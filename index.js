// This is a boilerplate file which should not need to be changed.
module.exports = require('machine').pack({
  pkg: require('./package.json'),
  dir: __dirname
});



//... well except for this.
// Also give the driver a `mongodb` property, so that it provides access
// to the static Mongo library for Node.js. (See http://npmjs.com/package/mongodb)
module.exports.mongodb = require('mongodb');
