import { UsersDb } from './data/usersDb';
import { Api } from './api/api';
import * as worker from './worker';

/**
 * Starts worker with local in-memory database
 */
export const run = (host: string, port: number) => {
    const db = new UsersDb();
    const api = new Api(db);
    worker.run(host, port, api);
}
