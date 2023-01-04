import * as multi from './multi';
import * as single from './single';

const host = 'localhost';
const port = +process.env.PORT || 4000;

const isMulti = process.argv.splice(2).includes('--multi');
console.log('isMulti', isMulti);

if (isMulti) {

    multi.run(host, port);

} else {

    single.run(host, port);

}
