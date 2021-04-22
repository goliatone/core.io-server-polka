'use strict';

function makeHtmlErrorHandler(router) {
    return function $htmlErrorHandler(handler) {
        return async function $handler(req, res) {
            try {
                await handler(req, res);
            } catch (error) {
                console.log('error', error);
                router.$server.serverOptions.onHtmlError(error, req, res);
            }
        }
    };
}

module.exports = makeHtmlErrorHandler;
