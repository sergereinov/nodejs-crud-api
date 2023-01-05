/**
 * Customizable Logger.
 * 
 * Usage example:
 * ```
 * import { logger, getLogger, setLogger } from './logger';
 * 
 * logger('Hello'); //prints '2023-01-05T18:23:50.846Z pid 17108 Hello'
 * 
 * const oldLogger = getLogger();
 * setLogger((args) => oldLogger('[DB-Worker]', ...args));
 * 
 * logger('Hello'); //prints '2023-01-05T18:23:50.846Z pid 17108 [DB-Worker] Hello'
 * ```
 */

export const logger = (...args: any[]): void => currentLogger(args);

export const baseLogger = (...args: any[]): void =>
    console.log(new Date(), 'pid', process.pid, ...args);

var currentLogger = baseLogger;

export const getLogger = () => currentLogger
export const setLogger = (cb: (...args: any[]) => void) => {
    currentLogger = cb;
}

