'use strict';

const test = require('tape');
const sinon = require('sinon');

const Module = require('../lib/core.io-server-polka');

test('Module should be bootstraped OK', t => {
    t.ok(new Module());
    t.end();
});
