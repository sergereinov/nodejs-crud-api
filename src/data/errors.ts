export abstract class DbError extends Error { };
export class DbEntryNotFoundError extends DbError { };
export class DbInvalidEntryError extends DbError { };
export class DbInternalError extends DbError { };
