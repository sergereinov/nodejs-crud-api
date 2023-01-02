export abstract class ApiError extends Error { };
export class ApiJsonSyntaxError extends ApiError { };
export class ApiInvalidInputError extends ApiError { };
export class ApiResourceNotFoundError extends ApiError { };
