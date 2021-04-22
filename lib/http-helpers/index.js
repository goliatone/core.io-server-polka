'use strict';
const extend = require('gextend');
const KeyPath = require('gkeypath');
const send = require('@polka/send');
const redirect = require('@polka/redirect');

let defaultResponderOptions = {
    metadataKeyword: '$meta',
    responseBodyIgnoreKeys: ['$meta'],
    decodeResponseBody(reply = {}, ignoreKeys = []) {
        /**
         * Note: we really want to wrap our response
         * body in a body attribute. Parsing the object
         * adds latency!
         */
        if (reply.body) return reply.body;

        let out = {};

        Object.keys(reply).forEach(key => {
            if (ignoreKeys.includes(key)) return;
            out[key] = reply[key];
        });

        return out;
    }
};

/**
 * Make a response handler.
 * 
 * @param {http.ServerRequest} req ServerRequest object
 * @param {http.ServerResponse} res ServerResponse object
 * @param {Object} [options={}] Config options
 * @param {String} [options.metadataKeyword='meta'] Response key attribute for meta
 * @param {Function} [options.decodeResponseBody] Decode response body from reply event
 * 
 * @returns {Function}
 */
function makeResponder(req, res, options = {}) {

    options = extend({}, defaultResponderOptions, options);

    const {
        metadataKeyword,
        responseBodyIgnoreKeys,
        decodeResponseBody
    } = options;

    return function respondTo(event, error) {
        let reply = event.response;

        let body = decodeResponseBody(reply, responseBodyIgnoreKeys);

        let statusCode = KeyPath.get(reply, `${metadataKeyword}.statusCode`, 200);
        let headers = KeyPath.get(reply, `${metadataKeyword}.headers`, {});

        //NOTE: we can get 
        //let req = res.socket.parser.incoming;
        if (wantsHTML(req)) {
            headers['content-type'] = 'text/html';
        }

        if (wantsJSON(req) && !hasHeader(headers, 'content-type')) {
            headers['content-type'] = 'application/json';
        }

        send(res, statusCode, body, headers);
    };
}

function hasHeader(headers, header = '') {
    return !!headers[header.toLowerCase()];
}

/**
 * We use this mostly to clone http objects
 * such as query and body so that we can 
 * extend them.
 * 
 * @param {Object} src Source object
 * @param {String[]} attrs List of attributes to pick
 * @param {Object} out Cloned object
 */
function clone(src, attrs = [], out = {}) {
    let keyCheck = attrs.length > 0;

    function validKey(key) {
        if (!keyCheck) return true;
        return attrs.includes(key);
    }
    for (let key in src) {
        if (validKey(key)) out[key] = src[key];
    }
    return out;
}

/**
 * Get an IP from a request
 * @param {http.ServerRequest} req 
 */
function getIp(req, def = false) {
    return (req.headers['x-forwarded-for'] || '').split(',').pop() ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || def;
}

/**
 * Function to serialize user for 
 * session
 * TODO: This should be part of Auth module
 * 
 * @param {Object} user User object 
 */
function serializeUser(user) {
    return {
        id: user.id,
        email: user.email,
        avatar: user.avatar
    };
}

function wantsJSON(req) {
    return req.headers && (req.headers['accept'] || '').indexOf('json') > -1;
}

function wantsHTML(req) {
    return req.headers && (req.headers['accept'] || '').indexOf('html') > -1;
}

module.exports.wantsJSON = wantsJSON;
module.exports.wantsHTML = wantsHTML;

module.exports.send = send;
module.exports.redirect = redirect;
module.exports.getIp = getIp;
module.exports.clone = clone;
module.exports.makeResponder = makeResponder;
module.exports.serializeUser = serializeUser;