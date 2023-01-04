import http from 'node:http';
import { ApiJsonSyntaxError } from './errors';

/**
 * Load body from http.IncomingMessage and parse json into object
 * @throws SyntaxError
 */
export const loadBodyJson = async (reader: http.IncomingMessage): Promise<object> => {
    const buf = [];
    for await (const chunk of reader) {
        buf.push(chunk);
    }
    const body = Buffer.concat(buf).toString();
    try {
        const obj = JSON.parse(body);
        return obj;
    } catch (e) {
        throw new ApiJsonSyntaxError('failed to parse body json');
    }
}
