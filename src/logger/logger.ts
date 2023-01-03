export const logger = (...args: any[]): void =>
    console.log(new Date(), 'pid', process.pid, ...args);
