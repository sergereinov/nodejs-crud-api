import http from 'node:http';
import * as EDb from '../data/errors';
import * as EApi from './errors';
import * as Status from './status';

export const responseWithCode = (response: http.ServerResponse, code: number, result?: object): void => {
    response.statusCode = code;
    response.statusMessage = http.STATUS_CODES[code];
    response.setHeader('Content-Type', 'application/json');
    if (result) {
        response.write(JSON.stringify(result));
    }
    response.end();
}

export const responseWithError = (response: http.ServerResponse, error: any): void => {
    const { code, text, msg } = explainError(error);
    [response.statusCode, response.statusMessage] = [code, text];
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ error: code, message: msg }));
}

//export const responseWithNotFound = (response: http.ServerResponse) =>
//    responseWithError(response, new EApi.ApiResourceNotFoundError('resource not found'));

export const explainError = (error: Error): { code: number, text: string, msg: string } => {
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
