'use strict';
const fs = require('fs');
const createServer = require('./createServer');
const { findDirectoryPathInModule } = require('./path-helpers');

/**
 * TODO: Make compatible with core.io-express-server
 * @see https://github.com/goliatone/core.io-express-server/blob/master/lib/initializeSubapp.js
 * 
 * ```js
 * const app = require('core.io-server-polka').initializeSubapp({
 *     moduleDirName: __dirname
 * });
 * module.exports.init = app;
 * 
 * module.exports.alias = 'admin';
 *```
 * 
 * @param {Object} App 
 * @param {Object} [options={}] 
 */
module.exports = function $initializeSubapp(App, options = {}) {

    /**
     * Usually we pass a configuration object rather
     * than a custom application.
     */
    if (arguments.length === 1 && typeof App.init !== 'function') {
        options = App;
    }

    return function $init(context, config) {

        let logger;

        if (config.logger) logger = config.logger;
        else {
            logger = context.getLogger(config.moduleid);
            config.logger = logger;
        }

        const routes = findDirectoryPathInModule('routes', options.moduleDirName, config.moduleid);
        const middleware = findDirectoryPathInModule('middleware', options.moduleDirName, config.moduleid);

        logger.info('Initializing module %s', config.moduleid);
        logger.info('-> routes %s', routes);
        logger.info('-> middleware %s', middleware);

        /**
         * Announce that we are available 
         * at this address :) 
         */
        context.once('modules.resolved', _ => {
            const style = {
                __meta__: {
                    style: 'bold+white+magenta_bg'
                }
            };

            context.logger.info('Server is running at %s', config.baseUrl, style);
        });

        return new Promise(async(resolve, reject) => {

            /**
             * Load our deps like e.g. persistence
             */
            try {
                await context.resolve(config.dependencies, true);

                /**
                 * We can overwrite the default classes used
                 * to handle req/res.
                 * We can also pass certificate information.
                 */
                const server = createServer(config.options);

                logger.info('dependencies resolved...');

                /**
                 * Set context so it is available to
                 * all routes.
                 */
                server.context = context;

                server.listen(config.port, err => {
                    if (err) {
                        logger.error('ERROR: %s', err);
                        return reject(err);
                    }

                    /************************************************
                     * MIDDLEWARE
                     * Register root level middleware
                     ***********************************************/
                    if (fs.existsSync(middleware)) {
                        require(middleware).init(server.engine, config);
                    }

                    /************************************************
                     * ROUTES
                     * Register root level routes
                     ***********************************************/
                    if (fs.existsSync(routes)) {
                        require(routes).init(server.engine, config);
                    }

                    /************************************************
                     * Resolve our instance...
                     ***********************************************/
                    resolve(server);
                });
            } catch (error) {
                reject(error);
            }
        });
    };
};