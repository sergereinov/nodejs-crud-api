import http from 'node:http';
import { ApiRouter } from './api/apiRouter';
import { logger } from './logger/logger';

/**
 * Starts http-server on given host and port and with given api.
 */
export const run = (host: string, port: number, api: ApiRouter, name: string = 'Worker') =>
    http
        .createServer((request, response) => {
            api.route(request, response);
        })
        .listen(port, host, () => {
            logger(`${name} is running on http://${host}:${port}`);
        });
