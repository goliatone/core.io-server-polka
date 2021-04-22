'use strict';

const test = require('tape');
const http = require('http');

const helpers = require('../').httpHelpers;

test('helpers bootstraped OK', t => {
    t.ok(helpers);
    t.end();
});

test('helpers.hasHeader', t => {
    let headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
    };

    t.true(helpers.hasHeader(headers, 'accept'), 'Should return true for accept');
    t.true(helpers.hasHeader(headers, 'content-type'), 'Should return true for content-type');
    t.false(helpers.hasHeader(headers, 'x-powered-by'), 'Should return false for x-powered-by');
    t.false(helpers.hasHeader(undefined, 'x-powered-by'), 'Should return false for undefined header');

    t.end();
});


test('helpers.wantsJSON', t => {
    let headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
    };

    t.true(helpers.wantsJSON({ headers }), 'Should return true for valid application/json');
    t.false(helpers.wantsJSON({ headers: {} }), 'Should return false if not application/json');
    t.false(helpers.wantsJSON(undefined), 'Should return false if no request provided');
    t.false(helpers.wantsJSON({}), 'Should return false if no request provided');


    t.end();
});

test('helpers.wantsHTML', t => {
    let headers = {
        'accept': 'text/html',
        'content-type': 'text/html',
    };

    t.true(helpers.wantsHTML({ headers }), 'Should return true for valid text/html');
    t.false(helpers.wantsHTML({ headers: {} }), 'Should return false if not text/html');
    t.false(helpers.wantsHTML(undefined), 'Should return false if no request provided');
    t.false(helpers.wantsHTML({}), 'Should return false if no request provided');


    t.end();
});

test('helpers.serializeUser', t => {
    let user = {
        id: 1,
        email: 'test@me.com',
        avatar: 'image.png',
        nick: 'peperone',
        firstName: 'pepe',
        lastName: 'rone',
    };

    let expected = {
        id: 1,
        email: 'test@me.com',
        avatar: 'image.png',
    };

    let expected2 = {
        nick: 'peperone',
        firstName: 'pepe',
        lastName: 'rone',
    };

    let fields = ['nick', 'firstName', 'lastName'];

    t.deepEquals(helpers.serializeUser(user), expected, 'Should return serialized user');
    t.deepEquals(helpers.serializeUser(user, fields), expected2, 'Should return serialized user with custom fields');
    t.deepEquals(helpers.serializeUser(undefined), {}, 'Should return empty user');


    t.end();
});

test('helpers.getIp: x-forwarded-for header', t => {

    let expected = '10.10.10.10';

    let req = {
        headers: { 'x-forwarded-for': expected }
    };

    t.equals(helpers.getIp(req), expected, 'Should return expected IP');
    t.false(helpers.getIp(), 'Should return false if no argument');
    t.false(helpers.getIp(undefined), 'Should return false if req is undefined');
    t.equals(helpers.getIp(undefined, 'localhost'), 'localhost', 'Should return "localhost" if default value');
    t.end();
});

test('helpers.getIp: connection remote address', t => {

    let expected = '10.10.10.10';

    let req = {
        connection: { 'remoteAddress': expected }
    };

    t.equals(helpers.getIp(req), expected, 'Should return expected IP');
    t.false(helpers.getIp(), 'Should return false if no argument');
    t.false(helpers.getIp(undefined), 'Should return false if req is undefined');
    t.equals(helpers.getIp(undefined, 'localhost'), 'localhost', 'Should return "localhost" if default value');
    t.end();
});

test('helpers.getIp: socket remote address', t => {

    let expected = '10.10.10.10';

    let req = {
        socket: { 'remoteAddress': expected }
    };

    t.equals(helpers.getIp(req), expected, 'Should return expected IP');
    t.false(helpers.getIp(), 'Should return false if no argument');
    t.false(helpers.getIp(undefined), 'Should return false if req is undefined');
    t.equals(helpers.getIp(undefined, 'localhost'), 'localhost', 'Should return "localhost" if default value');
    t.end();
});

test('helpers.getIp: connection socket remote address', t => {

    let expected = '10.10.10.10';

    let req = {
        connection: { socket: { 'remoteAddress': expected } }
    };

    t.equals(helpers.getIp(req), expected, 'Should return expected IP');
    t.false(helpers.getIp(), 'Should return false if no argument');
    t.false(helpers.getIp(undefined), 'Should return false if req is undefined');
    t.equals(helpers.getIp(undefined, 'localhost'), 'localhost', 'Should return "localhost" if default value');

    t.end();
});

test('helpers.clone', t => {

    const options = {
        host: '127.0.0.1',
        method: 'CONNECT',
        path: 'www.google.com:80'
    };

    const out = {
        test: true
    };

    const expected = {
        test: true,
        host: '127.0.0.1',
        method: 'CONNECT',
        path: 'www.google.com:80'
    };

    const req = new http.ClientRequest(options);
    req.end();

    t.deepEquals(helpers.clone(options), options, 'Should return expected object');

    t.deepEquals(helpers.clone(req, ['host', 'method', 'path']), options, 'Should return expected object');

    t.deepEquals(helpers.clone(req, ['host', 'method', 'path'], out), expected, 'Should return extended out object');

    t.deepEquals(helpers.clone(), {}, 'Should return empty object if no argument');

    t.deepEquals(helpers.clone(undefined), {}, 'Should return empty object if undefined src');

    t.end();
});

test.skip('helpers.makeResponder', t => {
    t.end();
});