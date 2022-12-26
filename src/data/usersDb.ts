import { User } from './user';
import { DbEntryNotFoundError, DbEntryAlreadyExistError, DbError } from './errors';
import { Repository } from './repository';

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

/*
// TODO move it all bellow to unit tests

const db: Repository = new UsersDb();
console.log('db =', db);

db.create({
    id: '1',
    username: 'name1',
    age: 1,
    hobbies: ['hob1', 'hob2']
});

console.log('db =', db);

try {
    db.create({
        id: '1',
        username: 'name1',
        age: 1,
        hobbies: ['hob1', 'hob2']
    });
} catch (e) {
    console.log(e);
    console.log('typeof e is', typeof e);
    console.log('e instanceof Error is', e instanceof Error);
    console.log('e instanceof DbError is', e instanceof DbError);
    console.log('e instanceof DbEntryNotFoundError is', e instanceof DbEntryNotFoundError);
    console.log('e instanceof DbEntryAlreadyExistError is', e instanceof DbEntryAlreadyExistError);
    console.log('e.constructor is', (e as Error).constructor);
    console.log('e.constructor === DbEntryNotFoundError is', (e as Error).constructor === DbEntryNotFoundError);
    console.log('e.constructor === DbEntryAlreadyExistError is', (e as Error).constructor === DbEntryAlreadyExistError);
}

console.log('db =', db);

db.create({
    id: '2',
    username: 'name2',
    age: 2,
    hobbies: ['hob3', 'hob3']
});

console.log('db =', db);

console.log('users =', db.getAll());

const u1 = db.getById('1');

// console.log('u1 (before) =', u1);
// (u1 as User).username = 'updated name for name1';
// console.log('u1 (after) =', u1);
// console.log('db (after) =', db);

db.deleteById('1');

console.log('db =', db);

// const all = db.getAll();
// console.log('all (before) =', all);
// all[0].username = 'second updated name2';
// console.log('all (after) =', all);
// console.log('db (after) =', db);
*/