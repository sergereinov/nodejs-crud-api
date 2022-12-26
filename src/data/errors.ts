export abstract class DbError extends Error { };
export class DbEntryNotFoundError extends DbError { };
export class DbEntryAlreadyExistError extends DbError { };
