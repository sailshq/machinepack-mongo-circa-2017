<h1>
  <a href="http://node-machine.org" title="Node-Machine public registry"><img alt="node-machine logo" title="Node-Machine Project" src="http://node-machine.org/images/machine-anthropomorph-for-white-bg.png" width="50" /></a>
  machinepack-mongo
</h1>


### [Docs](http://node-machine.org/machinepack-mongo) &nbsp; [Browse other machines](http://node-machine.org/machinepacks) &nbsp;  [FAQ](http://node-machine.org/implementing/FAQ)  &nbsp;  [Support/Resources](http://sailsjs.com/support)

Structured, low-level Node.js bindings for MongoDB.

> A Waterline driver, compatible with the Sails framework and Waterline ORM.

## WARNING
This module has been mostly superceded by [`sails-mongo`](https://www.npmjs.com/package/sails-mongo),
which contains the machines from this repo as well other machines.  Note that the machines in sails-mongo
**are not pre-built** (aka "wet"), so you'll need to build them yourself, e.g.:

```javascript
require('machine').build(require('sails-mongo').createManager)
```

> For more background, check out [this diagram](https://docs.google.com/drawings/d/11rNJuuNdTNdX_JLUxU9qnAyb5aZHlVJQCijTgSbWSgY/edit).


## Installation &nbsp; [![NPM version](https://badge.fury.io/js/machinepack-mongo.svg)](http://badge.fury.io/js/machinepack-mongo) [![Build Status](https://travis-ci.org/treelinehq/machinepack-mongo.png?branch=master)](https://travis-ci.org/treelinehq/machinepack-mongo)

```sh
$ npm install machinepack-mongo
```

## Usage

For the latest usage documentation, version information, and test status of this module, see <a href="http://node-machine.org/machinepack-mongo" title="Structured Node.js bindings for MongoDB. (for node.js)">http://node-machine.org/machinepack-mongo</a>.  The generated manpages for each machine contain a complete reference of all expected inputs, possible exit states, and example return values.


## Help

If you have questions or are having trouble, click [here](http://sailsjs.com/support).


## Bugs &nbsp; [![NPM version](https://badge.fury.io/js/machinepack-mongo.svg)](http://npmjs.com/package/machinepack-mongo)

To report a bug, [click here](http://sailsjs.com/bugs).


## Contributing

Please observe the guidelines and conventions laid out in the [Sails project contribution guide](http://sailsjs.com/documentation/contributing) when opening issues or submitting pull requests.

[![NPM](https://nodei.co/npm/machinepack-mongo.png?downloads=true)](http://npmjs.com/package/machinepack-mongo)


## License

This package, like the [Sails framework](http://sailsjs.com), is free and open-source under the [MIT License](http://sailsjs.com/license).
