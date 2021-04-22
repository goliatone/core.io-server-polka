'use strict';

const Module = require('./core.io-server-polka');

module.exports = function $init(context, config) {

    var _logger = context.getLogger('core.io-server-polka');

    _logger.info('core.io-server-polka module booting...');

    return new Promise(function(resolve, reject) {
        context.resolve({});
    });
};