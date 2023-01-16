import http from 'node:http';
import * as EDb from '../data/errors';
import * as EApi from './errors';
import * as Status from './status';
import { logger } from '../logger/logger';

export const responseWithCode = (response: http.ServerResponse, code: number, result?: object): void => {
    const text = http.STATUS_CODES[code];
    const body = result && JSON.stringify(result)
    
    logger(`${code} ${text}, body is`, body || '(empty)');

    [response.statusCode, response.statusMessage] = [code, text];
    response.setHeader('Content-Type', 'application/json');
    if (body) {
        response.write(body);
    }
    response.end();
}

export const responseWithError = (response: http.ServerResponse, error: any): void => {
    logger('error', error.constructor, error.message);

    const { code, text, msg } = explainError(error);
    [response.statusCode, response.statusMessage] = [code, text];
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ error: code, message: msg }));
}

export const explainError = (error: any): { code: number, text: string, msg: string } => {
    if (error instanceof Error) {

        if (error instanceof EDb.DbError) {
            switch (error.constructor) {
                case EDb.DbEntryNotFoundError:
                    return { ...Status.notFound(), ...{ msg: error.message } };
                case EDb.DbInvalidEntryError:
                    return { ...Status.badRequest(), ...{ msg: error.message } };
                case EDb.DbInternalError:
                    return { ...Status.internalServerError(), ...{ msg: error.message } };
            };
        }

        if (error instanceof EApi.ApiError) {
            switch (error.constructor) {
                case EApi.ApiJsonSyntaxError:
                case EApi.ApiInvalidInputError:
                    return { ...Status.badRequest(), ...{ msg: error.message } };
                case EApi.ApiResourceNotFoundError:
                    return { ...Status.notFound(), ...{ msg: error.message } };
            };
        }

        // other is internal server error
    }

    // other is internal server error
    return { ...Status.internalServerError(), ...{ msg: 'internal server error' } };
}
