import http from 'node:http';
import * as EDb from '../data/errors';
import * as Status from '../api/status';
import { loadBodyJson } from '../api/request';
import { logger } from '../logger/logger';

type RequestMethods = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Helper. Load error message from body json.
 * 
 * Expected body object format like `{ msg: string }`
 */
const loadErrorMsg = async (response: http.IncomingMessage): Promise<string | null> => {
    const obj = await loadBodyJson(response);
    const msg = ('message' in obj) ? obj.message.toString() : null;
    return msg;
}

/**
 * Http request helper.
 * 
 * Query REST API and return result object from response body.
 */
export const queryRAPI = async (
    options: object,
    method: RequestMethods,
    path: string,
    data: object | undefined = undefined
): Promise<object> => {
    const opt = { ...options, ...{ method: method, path: path } };

    const promise = new Promise<object>((resolve, reject) => {

        // Make request
        const req = http.request(opt, async (response) => {
            // Parse response
            try {
                switch (response.statusCode) {

                    case Status.codeNotFound:
                        reject(new EDb.DbEntryNotFoundError(
                            await loadErrorMsg(response) || 'resource not found'
                        ));
                        return;

                    case Status.codeBadRequest:
                        reject(new EDb.DbInvalidEntryError(
                            await loadErrorMsg(response) || 'bad request'
                        ));
                        return;

                    default:
                    case Status.codeInternalServerError:
                        reject(new EDb.DbInternalError(
                            await loadErrorMsg(response) || 'internal server error'
                        ));
                        return;

                    case Status.codeOk:
                    case Status.codeCreated:
                        // ok with object
                        resolve(await loadBodyJson(response));
                        return;

                    case Status.codeNoContent:
                        // ok with no content
                        resolve({});
                        return;
                }
            } catch (e) {
                logger('RemoteUsersDb.request exception:', e);
                reject(e); //internal server error
            }
        });

        req.on('error', (e) => {
            logger('problem with RemoteUsersDb.request:', e);
            reject(e);
        });

        // Send body
        if (data) {
            req.write(JSON.stringify(data));
        }

        // Finish the request
        req.end();
    });

    return promise;
}
