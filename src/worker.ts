import http from 'node:http'
import { ApiRouter } from './api/apiRouter'
import { logger } from './logger/logger';

/**
 * Starts http-server on given host and port and with given api.
 */
export const run = (host: string, port: number, api: ApiRouter) =>
    http
        .createServer((request, response) => {
            api.route(request, response);
        })
        .listen(port, host, () => {
            logger(`Worker is running on http://${host}:${port}`);
        });
