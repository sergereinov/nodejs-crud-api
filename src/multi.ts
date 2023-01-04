import cluster from 'node:cluster';
import { cpus } from 'node:os';
import { logger } from './logger/logger';
import { UsersDb } from './data/usersDb';
import { Api } from './api/api';
import * as worker from './worker';

/**
 * Run workers cluster:
 *  1. one instance of remote database (worker with in-memory database)
 *  2. n-th (cpus().length) instances of api workers
 *  3. instance of primary (local api server of load balancer)
 */
export const run = (host: string, port: number) => {

    if (cluster.isPrimary) {
        // Run primary

        logger(`Primary is running`);

        const remoteDbPort = port + 1;
        forkDatabaseWorker(remoteDbPort);

        const numCPUs = cpus().length;
        const firstWorkerPort = remoteDbPort + 1;
        forkApiWorkers(numCPUs, firstWorkerPort, remoteDbPort);

        //run load balancer
        //TODO

    } else {
        // Run the worker

        if ('DBPORT' in process.env) {
            const remoteDbPort = +process.env.DBPORT;
            runApiWorker(host, port, remoteDbPort);
        } else {
            runDatabaseWorker(host, port);
        }
    }

}

const forkDatabaseWorker = (databasePort: number) =>
    cluster.fork({ port: databasePort });

const forkApiWorkers = (count: number, firstWorkerPort: number, databasePort: number) => {
    for (let i = 0; i < count; i++) {
        const workerPort = firstWorkerPort + i;
        cluster.fork({ port: workerPort, dbPort: databasePort });
    }

    cluster.on('exit', (worker, code, signal) => {
        logger(`worker ${worker.process.pid} died`);
    });
}

const runApiWorker = (host: string, port: number, databasePort: number) => {
    //TODO
}

const runDatabaseWorker = (host: string, port: number) => {
    const db = new UsersDb();
    const api = new Api(db);
    worker.run(host, port, api);
}
