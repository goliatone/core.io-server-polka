'use strict';

const polka = require('polka');
const extend = require('gextend');
const PolkaServer = require('./server');

/**
 * 
 * @param {Object} [config={}]
 * @param {Object} config.serverOptions Options for polka server
 * @param {Object} config.transportOptions Options for http transport
 * @returns {PolkaServer} New instance of a PolkaServer
 */
function createServer(config = {}) {

    const protocol = config.https ? require('https') : require('http');

    const transport = protocol.createServer(config.transportOptions);

    /**
     * Polka server options
     */
    const options = extend({}, PolkaServer.defaults.serverOptions, config.serverOptions);

    options.server = transport;

    //TODO: Might want to make this a function so we can pass in error handler
    /**
     * polka options are:
     * - `server`: http server. 
     * - `onError`: catch-all error handler, executed when 
     * middleware throws an error
     * - `onNoMatch`: handle 404
     */
    const engine = polka(options);

    //rename server to engine, otherwise we have context.server.server.server
    //                                                  module | polka | http server 
    // We now have this:                         context.server.engine.server
    config.engine = engine;
    config.transport = transport;

    const instance = new PolkaServer(config);

    return instance;
}

module.exports = createServer;
