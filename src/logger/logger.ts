export const baseLogger = (...args: any[]): void =>
    console.log(new Date(), 'pid', process.pid, ...args);

var currentLogger = baseLogger;

export const getLogger = () => currentLogger
export const setLogger = (cb: (...args: any[]) => void) => {
    currentLogger = cb;
}

export const logger = (...args: any[]): void => currentLogger(args);
