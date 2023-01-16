import cluster from 'node:cluster';
import * as dotenv from 'dotenv'
import * as multi from './multi';
import * as single from './single';

dotenv.config();

const host = 'localhost';
const port = +process.env.PORT || 4000;

const isMulti = process.argv.splice(2).includes('--multi');

if (isMulti || cluster.isWorker) {

    multi.run(host, port);

} else {

    single.run(host, port);

}
