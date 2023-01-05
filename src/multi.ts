import cluster from 'node:cluster';
import { cpus } from 'node:os';
import { logger, setLogger, getLogger } from './logger/logger';
import { UsersDb } from './data/usersDb';
import { RemoteUsersDb } from './remotedb/remotedb';
import { Api } from './api/api';
import * as worker from './worker';
import * as loadBalancer from './loadBalancer/loadBalancer';

/**
 * Run workers cluster:
 *  1. one instance of remote database (worker with in-memory database)
 *  2. n-th (cpus().length) instances of api workers
 *  3. instance of primary (local api server of load balancer)
 */
export const run = (host: string, port: number) => {

    if (cluster.isPrimary) {
        // Run primary

        const oldLogger = getLogger();
        setLogger((args) => oldLogger('[PRIMARY]', ...args));

        logger(`Primary is running`);

        // Spawning the Database Worker
        const remoteDbPort = port + 1;
        forkDatabaseWorker(remoteDbPort);

        // Spawning a set of Api-Workers
        const count = cpus().length;
        const firstWorkerPort = remoteDbPort + 1;
        forkApiWorkers(count, firstWorkerPort, remoteDbPort);

        // Run the Load Balancer
        loadBalancer.run(host, port, firstWorkerPort, count);

    } else {
        // Run the Worker

        if ('DBPORT' in process.env) {
            // This is an API-worker            

            const id = +process.env.id || 0;
            const oldLogger = getLogger();
            setLogger((args) => oldLogger(`[API-${id}]`, ...args));

            const remoteDbPort = +process.env.DBPORT;
            runApiWorker(host, port, remoteDbPort);
        } else {
            // This is a Database worker
            
            const oldLogger = getLogger();
            setLogger((args) => oldLogger('[DB]', ...args));

            runDatabaseWorker(host, port);
        }
    }

}

const forkDatabaseWorker = (databasePort: number) =>
    cluster.fork({ port: databasePort });

const forkApiWorkers = (count: number, firstWorkerPort: number, databasePort: number) => {
    for (let i = 0; i < count; i++) {
        const workerPort = firstWorkerPort + i;
        cluster.fork({ port: workerPort, dbPort: databasePort, id: i + 1 });
    }

    cluster.on('exit', (worker, code, signal) => {
        logger(`worker ${worker.process.pid} died`);
    });
}

const runApiWorker = (host: string, port: number, databasePort: number) => {
    const db = new RemoteUsersDb(host, databasePort);
    const api = new Api(db);
    worker.run(host, port, api, 'API Worker');
}

const runDatabaseWorker = (host: string, port: number) => {
    const db = new UsersDb();
    const api = new Api(db);
    worker.run(host, port, api, 'Database Worker');
}
