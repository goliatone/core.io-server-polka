'use strict';

const http = require('http');
const polka = require('polka');
const extend = require('gextend');
const httpHelper = require('./http-helpers');

const defaults = {
    serverOptions: {
        onError: function(err, req, res, next) {

            let response = err;

            let code = (res.statusCode = err.code || err.status || 500);
            let message = err.message || http.STATUS_CODES[code];

            if (httpHelper.wantsJSON(req)) {
                if (typeof err === 'string' || Buffer.isBuffer(err)) response = { statusCode: code, message: err };
                else if (typeof err.toJSON === 'function') {
                    response = extend({}, { code, message }, err.toJSON());
                } else response = { code, message };
            } else {
                if (typeof err === 'string' || Buffer.isBuffer(err)) response = err;
                else response = message;
            }
            //TODO: Should we use code or statusCode in response?!
            httpHelper.send(res, code, response);
        },
        onHtmlError: function(err, req, res, next) {
            function makeDefaultViewFromCode(code) {
                return ('' + code).charAt(0) + '0X';
            }

            let code = (err.statusCode || err.status || 500);
            let message = err.message || http.STATUS_CODES[code];
            let view = err.view || makeDefaultViewFromCode(code);
            //TODO: Move to polka-view as renderError
            //TODO: Check if path exists, else print default template
            res.renderFile(`errors/${view}.html`, {
                code,
                message,
                error: err,
            });
        }
    }
};

class PolkaServer {
    constructor(config = {}) {
        config = extend({}, this.constructor.defaults, config);
        this.init(config);
    }

    init(config = {}) {
        if (this.initialized) return;
        this.initialized = true;

        /**
         * routers are sub applications.
         */
        this.routers = {};

        extend(this, config);
    }

    use(...args) {
        return this.engine.use(...args);
    }

    /**
     * 
     * @param {Object} options HTTP server options
     * @param {Function} callback Callback
     */
    listen(options = {}, callback) {
        return this.engine.listen(options, callback);
    }

    mountRouter(route) {
        const router = this.getRouter(route);
        if (!router) {
            return this.logger.error('Sub app "%s" not found', route);
        }
        this.logger.info('Using route "%s"', route);
        this.engine.use(route, router);

        return router;
    }

    /**
     * This will return a router for the 
     * given `id`. If no router is found we
     * create one, store it and return it.
     * 
     * @param {String} id Router identifier
     * @param {Object} options You can specify two functions: `onError` and `onNotFound`
     * @returns {Function}
     */
    getRouter(id, options = {}) {
        if (this.routers[id]) return this.routers[id];

        //TODO: We should decide how we want to handle this
        options = extend({}, this.serverOptions, options);

        const router = polka(this.serverOptions);

        router.$server = this;
        //TODO: Use router.$context
        if (this.context) router.context = this.context;

        this.routers[id] = router;
        return this.routers[id];
    }

    /**
     * Return transport, compatibility function.
     * @returns {http}
     */
    getTransport() {
        return this.transport;
    }

    get transport() {
        return this._transport;
    }

    set $server(value) {
        this._server = value;
    }

    get $server() {
        return this._server;
    }

    set context(value) {
        this._context = value;
    }

    get context() {
        return this._context;
    }
}

PolkaServer.defaults = defaults;

module.exports = PolkaServer;