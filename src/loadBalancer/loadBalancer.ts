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

    http.createServer(async (request, response) => {

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
            retranslateRequest(request, workersHost, workerPort, async (workerResponse) => {
                // Read reply from API-worker
                response.statusCode = workerResponse.statusCode;
                response.statusMessage = workerResponse.statusMessage;
                response.setHeader('Content-Type', 'application/json');

                // Read body from API-worker
                for await (const chunk of workerResponse) {
                    response.write(chunk);
                }

                // Done
                response.end();

                logger('Load balancer response:', workerResponse.statusCode, workerResponse.statusMessage);
            });

        } else {

            // Unknown basePath
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
}

/**
 * Retranslate request to API-worker
 */
const retranslateRequest = async (
    request: http.IncomingMessage,
    workerHost: string,
    workerPort: number,
    callback: (res: http.IncomingMessage) => void
) => {

    // Prepare options
    const options = {
        hostname: workerHost,
        port: workerPort,
        method: request.method,
        path: request.url,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Create request to API-worker
    const workerReq =
        http.request(options, callback)
            .on('error', (e) => {
                logger(`Load balancer has problem with worker at ${workerPort} port:`, e);
            });

    // Send body to API-worker
    for await (const chunk of request) {
        workerReq.write(chunk);
    }

    // Done
    workerReq.end();
}
