import http from 'node:http';
import { usersBaseUrl } from '../api/baseUrl';
import { logger } from '../logger/logger';
import * as Status from '../api/status';

export const run = (host: string, listenPort: number, firstWorkerPort: number, workersCount: number) => {
    var workersHost = host;
    var nextPort = firstWorkerPort;

    http
        .createServer(async (request, response) => {
            const { pathname } = new URL(request.url, `http://localhost`);
            if (pathname.startsWith(usersBaseUrl)) {

                logger(`Load balancer received a request: ${request.method} ${request.url}`);

                const workerPort = nextPort;

                nextPort++;
                if (nextPort >= firstWorkerPort + workersCount) {
                    nextPort = firstWorkerPort;
                }

                const opt = {
                    hostname: workersHost,
                    port: workerPort,
                    method: request.method,
                    path: pathname,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                const workerReq = http.request(opt, async (workerRes) => {
                    response.statusCode = workerRes.statusCode;
                    response.statusMessage = workerRes.statusMessage;
                    response.setHeader('Content-Type', 'application/json');

                    // Body
                    for await (const chunk of workerRes) {
                        response.write(chunk);
                    }

                    //Finish
                    response.end();

                    logger('Load balancer response:', workerRes.statusCode, workerRes.statusMessage);
                });

                workerReq.on('error', (e) => {
                    logger(`Load balancer has problem with worker at ${workerPort} port:`, e);
                });

                // Body
                for await (const chunk of request) {
                    workerReq.write(chunk);
                }

                // Finish
                workerReq.end();
            } else {

                //404
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
