/**
 * Api errors definition
 * 
 * Warning:
 *  `"target":"ES6"` (ES2015) or later should be set in `compilerOptions` for Error to inherit properly
 *  and be detected via instanceof.
 */

export abstract class ApiError extends Error { };
export class ApiJsonSyntaxError extends ApiError { };
export class ApiInvalidInputError extends ApiError { };
export class ApiResourceNotFoundError extends ApiError { };
