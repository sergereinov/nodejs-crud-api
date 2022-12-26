import { User } from './user';
import { DbEntryNotFoundError, DbEntryAlreadyExistError } from './errors';

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
     * @throws DbEntryNotFoundError
     */
    getById(userId: string): User {
        const u = this._users.find((u) => u.id === userId);
        if (!u) {
            throw new DbEntryNotFoundError(`user id ${userId} not found`);
        }

        return Object.assign({}, u);
    }

    /**
     * Create new user
     * @throws DbEntryAlreadyExistError
     */
    create(user: User): User {
        //check for exists
        if (this._users.find((u) => u.id === user.id)) {
            throw new DbEntryAlreadyExistError(`user with id ${user.id} already exist`);
        }

        //create user
        this._users.push(user);

        //return created user
        return Object.assign({}, this._users.at(-1));
    }

    /**
     * Update user by id
     * @throws DbEntryNotFoundError
     */
    update(user: User): User {
        const index = this._users.findIndex((u) => u.id === user.id)
        if (index < 0) {
            throw new DbEntryNotFoundError(`user id ${user.id} not found`);
        }

        this._users[index] = Object.assign({}, user);
        return Object.assign({}, this._users[index]);
    }

    /**
     * Delete user by id
     * @throws DbEntryNotFoundError
     */
    deleteById(userId: string): void {
        const index = this._users.findIndex((u) => u.id === userId)
        if (index < 0) {
            throw new DbEntryNotFoundError(`user id ${userId} not found`);
        }

        this._users.splice(index, 1);
    }
}
