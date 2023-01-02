import http from 'node:http'

export const statusCode = (code: number): { code: number, text: string } => ({
    code: code,
    text: http.STATUS_CODES[code]
});

export const codeOk = 200;
export const codeCreated = 201;
export const codeNoContent = 204;
export const codeBadRequest = 400;
export const codeNotFound = 404;
export const codeInternalServerError = 500;

export const ok = () => statusCode(codeOk);
export const created = () => statusCode(codeCreated);
export const noContent = () => statusCode(codeNoContent);
export const badRequest = () => statusCode(codeBadRequest);
export const notFound = () => statusCode(codeNotFound);
export const internalServerError = () => statusCode(codeInternalServerError);
