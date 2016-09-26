var assert = require('assert');
var Pack = require('../../');

describe('Queryable ::', function() {
  describe('Compile Statement', function() {
    it('should generate a Mongo Command Statement from a WLQL query', function(done) {
      Pack.compileStatement({
        statement: {
          select: ['title', 'author', 'year'],
          from: 'books'
        }
      })
      .exec(function(err, report) {
        if (err) {
          return done(err);
        }

        var expectedOutcome = {
          find: 'books',
          filter: {},
          sort: {},
          projection: {
            title: 1,
            author: 1,
            year: 1
          },
          skip: 0,
          limit: 0
        };

        assert.deepEqual(report.nativeQuery, expectedOutcome);
        return done();
      });
    });

    // TODO: Add lots of checking to the statement compiler
    it.skip('should return the malformed exit for bad WLQL', function(done) {
      Pack.compileStatement({
        statement: {
          foo: 'bar',
          from: 'books'
        }
      })
      .exec(function(err) {
        assert(err);
        assert.equal(err.exit, 'malformed');
        return done();
      });
    });
  });
});
