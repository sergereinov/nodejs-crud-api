import * as uuid from 'uuid';
import { User } from './user';
import { DbEntryNotFoundError, DbInvalidEntryError, DbInternalError } from './errors';

/**
 * In-memory Users Database
 */
export class UsersDb {
    private _users: User[];

    constructor() {
        this._users = [];
    }

    /**
     * Get all users
     */
    getAll = (): User[] => this._users.map((u) => Object.assign({}, u));

    /**
     * Get user by id
     * @throws `DbInvalidEntryError`, `DbEntryNotFoundError`
     */
    getById(userId: string): User {
        // check input
        this.validateUserId(userId);

        const u = this._users.find((u) => u.id === userId);
        if (!u) {
            throw new DbEntryNotFoundError(`user id ${userId} not found`);
        }

        return Object.assign({}, u);
    }

    /**
     * Create new user
     * @throws `DbInvalidEntryError`
     */
    create(userProperties: Partial<User>): User {
        //check for required fields
        if (userProperties.id) {
            throw new DbInvalidEntryError('invalid field format, id field is redundant')
        }
        this.validateUserProperties(userProperties);

        //build new User
        const user: User = {
            id: this.uniqeUserId(),
            username: userProperties.username,
            age: userProperties.age,
            hobbies: [...userProperties.hobbies]
        }

        //create user
        this._users.push(user);

        //return created user
        return Object.assign({}, this._users.at(-1));
    }

    /**
     * Update user by id
     * @throws `DbInvalidEntryError`, `DbEntryNotFoundError`
     */
    update(user: User): User {
        // check input
        this.validateUserId(user.id);
        this.validateUserProperties(user);

        // check existence
        const index = this._users.findIndex((u) => u.id === user.id)
        if (index < 0) {
            throw new DbEntryNotFoundError(`user id ${user.id} not found`);
        }

        // update the user
        this._users[index] = Object.assign({}, user);
        return Object.assign({}, this._users[index]);
    }

    /**
     * Delete user by id
     * @throws `DbInvalidEntryError`, `DbEntryNotFoundError`
     */
    deleteById(userId: string): void {
        // check input
        this.validateUserId(userId);

        // find user
        const index = this._users.findIndex((u) => u.id === userId)
        if (index < 0) {
            throw new DbEntryNotFoundError(`user id ${userId} not found`);
        }

        // remove user
        this._users.splice(index, 1);
    }

    /**
     * Validate user id helper
     * @throws `DbInvalidEntryError` on error
     */
    private validateUserId(userId: string) {
        if (!userId || !uuid.validate(userId)) {
            throw new DbInvalidEntryError('invalid field format, user id must be an uuid');
        }
    }

    /**
     * Validate user properties (except user id) helper
     * @throws `DbInvalidEntryError` on error
     */
    private validateUserProperties(userProperties: Partial<User>) {
        if (!userProperties.username || typeof userProperties.username !== 'string') {
            throw new DbInvalidEntryError('invalid field format, username must be a string');
        }
        if (!userProperties.age || typeof userProperties.age !== 'number') {
            throw new DbInvalidEntryError('invalid field format, age must be a number');
        }
        if (!userProperties.hobbies || !Array.isArray(userProperties.hobbies) ||
            !userProperties.hobbies.every((h) => typeof h === 'string')) {
            throw new DbInvalidEntryError('invalid field format, hobbies must be an array of strings');
        }
    }

    /**
     * Generate unique user id
     * @throws `DbInternalError` when failed to get unique value five times
     */
    private uniqeUserId(): string {
        for (var i = 0; i < 5; ++i) {
            const id = uuid.v4(); //random uuid
            if (!this._users.find((u) => u.id === id)) {
                return id;
            }
        }
        throw new DbInternalError('failed to generate unique user id');
    }

}
