// npm packages
import log4js from 'log4js';

// config files
import loggerConfig from '../../config/logger.config.json';

log4js.configure(loggerConfig);

export const consoleLogger = log4js.getLogger('default');
export const appLogger = log4js.getLogger('app');
