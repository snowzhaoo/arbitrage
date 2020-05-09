"use strict";

import { configure, getLogger, Logger } from 'log4js';

class Log {
    logger: Logger;
    constructor() {
        this.logger = getLogger();
        this.logger.level = 'error';
        configure({
            appenders: { arbitrage: { type: 'file', filename: 'arbitrage.log' } },
            categories: { default: { appenders: ['arbitrage'], level: 'error' } }
        });
    }
}
const logger = (new Log()).logger;
export { logger }