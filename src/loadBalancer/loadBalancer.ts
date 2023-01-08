import http from 'node:http';
import { usersBaseUrl } from '../api/baseUrl';
import { logger } from '../logger/logger';
import * as Status from '../api/status';

/**
 * Starts http-server with Load Balancer.
 */
export const run = (host: string, listenPort: number, firstWorkerPort: number, workersCount: number) => {
    var workersHost = host;
    var nextPort = firstWorkerPort;

    const balancerServer = http.createServer(async (request, response) => {

        // Extract base path:
        //   - split '/api/users/other-things' to ['', 'api', 'users', 'other-things']
        //   - join it into '/api/users'
        const basePath = request.url.split('/').slice(0, 3).join('/');
        if (basePath === usersBaseUrl) {

            logger(`Load balancer received a request: ${request.method} ${request.url}`);

            const workerPort = nextPort;

            nextPort++;
            if (nextPort >= firstWorkerPort + workersCount) {
                nextPort = firstWorkerPort;
            }

            // Retranslate request to API-worker
            retranslateRequest(request, workersHost, workerPort)
                .then(async (workerResponse) => {
                    // Read reply from API-worker
                    response.statusCode = workerResponse.statusCode;
                    response.statusMessage = workerResponse.statusMessage;
                    response.setHeader('Content-Type', 'application/json');

                    // Pipe API-worker response body to the original client
                    workerResponse.pipe(response);

                    logger('Load balancer response:', workerResponse.statusCode, workerResponse.statusMessage);
                })
                .catch((e) => {
                    // 500 Problem with worker
                    const { code, text } = Status.internalServerError();
                    const msg = 'problem with worker';
                    [response.statusCode, response.statusMessage] = [code, text];
                    response.setHeader('Content-Type', 'application/json');
                    response.end(JSON.stringify({ error: code, message: msg }));

                    logger(`Load balancer has problem with worker at ${workerPort} port:`, e);
                });

        } else {

            // 404 Unknown path
            const { code, text } = Status.notFound();
            const msg = 'unknown endpoint for load balancer';
            [response.statusCode, response.statusMessage] = [code, text];
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ error: code, message: msg }));

            logger(`${msg}: ${request.method} ${request.url}`);

        }
    })
        .listen(listenPort, host, () => {
            logger(`Load balancer is running on http://${host}:${listenPort}`);
        });

    return balancerServer;
}

/**
 * Retranslate request to API-worker
 */
const retranslateRequest = async (
    request: http.IncomingMessage,
    workerHost: string,
    workerPort: number
): Promise<http.IncomingMessage> => new Promise((resolve, reject) => {

    // Prepare the options
    const options = {
        hostname: workerHost,
        port: workerPort,
        method: request.method,
        path: request.url,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Create new request to API-worker
    const workerRequest = http.request(options, (workerResponse) => resolve(workerResponse))
        .on('error', reject);

    // Pipe incoming request body to the selected API-worker
    request.pipe(workerRequest);
});
