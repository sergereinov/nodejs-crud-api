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
        setLogger((...args) => oldLogger('[PRIMARY]', ...args));

        logger('Primary is running');

        // Prepare params
        const count = cpus().length;
        const loadBalancerPort = port;
        const firstWorkerPort = loadBalancerPort + 1;
        const remoteDbPort = firstWorkerPort + count + 1;

        // Spawning the Database Worker
        forkDatabaseWorker(remoteDbPort);

        // Spawning a set of Api-Workers
        forkApiWorkers(count, firstWorkerPort, remoteDbPort);

        // Diag
        cluster.on('exit', (worker, code, signal) => {
            logger(`worker ${worker.process.pid} died`);
        });
    
        // Run the Load Balancer
        loadBalancer.run(host, loadBalancerPort, firstWorkerPort, count);

    } else {
        // Run the Worker

        const workerPort = +process.env.WORKER_PORT;

        if ('DB_PORT' in process.env) {
            // This is an API-worker with connection to a remote Database

            const id = +process.env.id || 0;
            const oldLogger = getLogger();
            setLogger((...args) => oldLogger(`[API-${id}]`, ...args));

            const remoteDbPort = +process.env.DB_PORT;
            runApiWorker(host, workerPort, remoteDbPort);
        } else {
            // This is a Database worker

            const oldLogger = getLogger();
            setLogger((...args) => oldLogger('[DB]', ...args));

            runDatabaseWorker(host, workerPort);
        }
    }
}

const forkDatabaseWorker = (databasePort: number) => {
    logger('Fork Database worker...');
    cluster.fork({ WORKER_PORT: databasePort });
}

const forkApiWorkers = (count: number, firstWorkerPort: number, databasePort: number) => {
    logger(`Fork ${count} API workers...`);
    for (let i = 0; i < count; i++) {
        const workerPort = firstWorkerPort + i;
        cluster.fork({ WORKER_PORT: workerPort, DB_PORT: databasePort, id: i + 1 });
    }
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
