import * as uuid from 'uuid';
import { Repository } from '../../../src/data/repository';
import { UsersDb } from '../../../src/data/usersDb';
import { DbError, DbEntryNotFoundError, DbInvalidEntryError } from '../../../src/data/errors'

describe('UsersDb', () => {
    let db: Repository;

    const partialUser = (factor: number) => ({
        username: `name${factor}`,
        age: factor,
        hobbies: [`hob1/${factor}`, `hob2/${factor}`]
    });

    beforeEach(() => {
        db = new UsersDb();
    });

    it('should be empty', async () => {
        expect(await db.getAll()).toHaveLength(0);
    });

    it('should create', async () => {
        expect(await db.getAll()).toHaveLength(0);
        await db.create(partialUser(1));
        expect(await db.getAll()).toHaveLength(1);
    });

    it('should read', async () => {
        expect(await db.getAll()).toHaveLength(0);
        const input = partialUser(1);

        await db.create(input);
        const all = await db.getAll();
        expect(all).toHaveLength(1);
        const user = { ...all[0], ...input }

        expect(all[0]).toMatchObject(user);
    });

    it('should read by id', async () => {
        expect(await db.getAll()).toHaveLength(0);
        const input = partialUser(1);

        await db.create(input);
        const all = await db.getAll();
        expect(all).toHaveLength(1);
        const user = { ...all[0], ...input }

        expect(await db.getById(user.id)).toMatchObject(user);
    });

    it('should update by id', async () => {
        expect(await db.getAll()).toHaveLength(0);
        const input = partialUser(1);

        await db.create(input);
        const all = await db.getAll();
        expect(all).toHaveLength(1);
        const user = { ...all[0], ...input }
        const nextUser = { ...user, ...partialUser(2) };

        expect(await db.update(nextUser)).toMatchObject(nextUser);
        expect(await db.getById(user.id)).toMatchObject(nextUser);
    });

    it('should delete by id', async () => {
        expect(await db.getAll()).toHaveLength(0);
        const input = partialUser(1);

        await db.create(input);
        const all = await db.getAll();
        expect(all).toHaveLength(1);
        const { id } = all[0];

        await db.deleteById(id);
        expect(await db.getAll()).toHaveLength(0);
    });

    it('should do CRUD', async () => {
        // Yes it violates the AAA dogma, but it must be tested in the complex

        expect(await db.getAll()).toHaveLength(0);

        //create
        const input1 = partialUser(1);
        const input2 = partialUser(2);
        const input3 = partialUser(3);
        const input4 = partialUser(4);
        await db.create(input1);
        await db.create(input2);
        await db.create(input3);
        await db.create(input4);

        //read
        let all = await db.getAll();
        expect(all).toHaveLength(4);
        const user1 = { ...all[0], ...input1 };
        const user2 = { ...all[1], ...input2 };
        const user3 = { ...all[2], ...input3 };
        const user4 = { ...all[3], ...input4 };
        expect(all).toMatchObject([
            user1,
            user2,
            user3,
            user4,
        ]);
        expect(await db.getById(user1.id)).toMatchObject(user1);
        expect(await db.getById(user2.id)).toMatchObject(user2);
        expect(await db.getById(user3.id)).toMatchObject(user3);
        expect(await db.getById(user4.id)).toMatchObject(user4);

        //update
        const nextUser1 = { ...user1, ...partialUser(11) };
        const nextUser2 = { ...user2, ...partialUser(12) };
        const nextUser3 = { ...user3, ...partialUser(13) };
        const nextUser4 = { ...user4, ...partialUser(14) };
        expect(await db.update(nextUser1)).toMatchObject(nextUser1);
        expect(await db.update(nextUser2)).toMatchObject(nextUser2);
        expect(await db.update(nextUser3)).toMatchObject(nextUser3);
        expect(await db.update(nextUser4)).toMatchObject(nextUser4);

        expect(await db.getById(user1.id)).toMatchObject(nextUser1);
        expect(await db.getById(user2.id)).toMatchObject(nextUser2);
        expect(await db.getById(user3.id)).toMatchObject(nextUser3);
        expect(await db.getById(user4.id)).toMatchObject(nextUser4);

        //delete
        expect(await db.getAll()).toHaveLength(4);
        await db.deleteById(user1.id);
        expect(await db.getAll()).toHaveLength(3);
        await db.deleteById(user2.id);
        expect(await db.getAll()).toHaveLength(2);
        await db.deleteById(user3.id);
        expect(await db.getAll()).toHaveLength(1);
        await db.deleteById(user4.id);
        expect(await db.getAll()).toHaveLength(0);
    })

    it('should throws DbInvalidEntryError at getById', async () => {
        await expect(() => db.getById(null)).rejects.toThrow(DbInvalidEntryError);
        await expect(() => db.getById('')).rejects.toThrow(DbInvalidEntryError);
        await expect(() => db.getById('1')).rejects.toThrow(DbInvalidEntryError);
    });

    it('should throws DbInvalidEntryError at create', async () => {
        await expect(() => db.create({})).rejects.toThrow(DbInvalidEntryError);
        await expect(() => db.create({ id: '1' })).rejects.toThrow(DbInvalidEntryError);
        await expect(() => db.create({ id: uuid.NIL })).rejects.toThrow(DbInvalidEntryError);
        await expect(() => db.create({ username: 'name' })).rejects.toThrow(DbInvalidEntryError);
        await expect(() => db.create({ username: 'name', age: 1 })).rejects.toThrow(DbInvalidEntryError);
        await expect(() => db.create({ username: 'name', hobbies: [] })).rejects.toThrow(DbInvalidEntryError);
        await expect(() => db.create({ age: 1, hobbies: [] })).rejects.toThrow(DbInvalidEntryError);
        await expect(() => db.create({ ...{ id: uuid.NIL }, ...partialUser(1) })).rejects.toThrow(DbInvalidEntryError);
    })

    it('should throws DbInvalidEntryError at update', async () => {
        await expect(() => db.update({ id: '1', username: 'n', age: 1, hobbies: [] })).rejects.toThrow(DbInvalidEntryError);
        await expect(() => db.update({ id: uuid.NIL, username: '', age: 1, hobbies: [] })).rejects.toThrow(DbInvalidEntryError);
        await expect(() => db.update({ id: uuid.NIL, username: 'n', age: 0, hobbies: [] })).rejects.toThrow(DbInvalidEntryError);
        await expect(() => db.update({ id: uuid.NIL, username: 'n', age: 1, hobbies: null })).rejects.toThrow(DbInvalidEntryError);
    })

    it('should throws DbInvalidEntryError at delete', async () => {
        await expect(() => db.deleteById(null)).rejects.toThrow(DbInvalidEntryError);
        await expect(() => db.deleteById('')).rejects.toThrow(DbInvalidEntryError);
        await expect(() => db.deleteById('1')).rejects.toThrow(DbInvalidEntryError);
    });

    it('should throws DbEntryNotFoundError at getById', async () => {
        expect(await db.getAll()).toHaveLength(0);
        await expect(() => db.getById(uuid.NIL)).rejects.toThrow(DbEntryNotFoundError);
    });

    it('should throws DbEntryNotFoundError at update', async () => {
        expect(await db.getAll()).toHaveLength(0);
        const nextUser = { ...{ id: uuid.NIL }, ...partialUser(1) };
        await expect(() => db.update(nextUser)).rejects.toThrow(DbEntryNotFoundError);
    });

    it('should throws DbEntryNotFoundError at deleteById', async () => {
        expect(await db.getAll()).toHaveLength(0);
        await expect(() => db.deleteById(uuid.NIL)).rejects.toThrow(DbEntryNotFoundError);
    });

    it('should be DbEntryNotFoundError type', () => {
        let e: any = new DbEntryNotFoundError();

        const shouldError = e instanceof Error;
        const shouldDbError = e instanceof DbError;

        // suitable for if-else checking
        const shouldDbEntryNotFoundError = e instanceof DbEntryNotFoundError;

        // suitable for switch-case checking 
        const shouldConstructor = (e.constructor === DbEntryNotFoundError);

        expect([shouldError, shouldDbError, shouldDbEntryNotFoundError, shouldConstructor])
            .not.toContain(false);
    })
});
