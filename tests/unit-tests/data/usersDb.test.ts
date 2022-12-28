import { Repository } from '../../../src/data/repository';
import { UsersDb } from '../../../src/data/usersDb';
import { DbError, DbEntryNotFoundError, DbEntryAlreadyExistError } from '../../../src/data/errors'

describe('UsersDb', () => {
    let db: Repository;

    const stubUser = (id: string, factor: number) => ({
        id: id,
        username: `name${factor}`,
        age: factor,
        hobbies: [`hob1/${factor}`, `hob2/${factor}`]
    });

    beforeEach(() => {
        db = new UsersDb();
    });

    it('should be empty', () => {
        expect(db.getAll()).toHaveLength(0);
    });

    it('should create', () => {
        expect(db.getAll()).toHaveLength(0);
        db.create(stubUser('1', 1));
        expect(db.getAll()).toHaveLength(1);
    });

    it('should read', () => {
        expect(db.getAll()).toHaveLength(0);
        db.create(stubUser('1', 1));
        expect(db.getAll()).toMatchObject([stubUser('1', 1)]);
    });

    it('should read by id', () => {
        expect(db.getAll()).toHaveLength(0);
        db.create(stubUser('1', 1));
        expect(db.getById('1')).toMatchObject(stubUser('1', 1));
    });

    it('should update by id', () => {
        expect(db.getAll()).toHaveLength(0);
        db.create(stubUser('1', 1));
        expect(db.update(stubUser('1', 2))).toMatchObject(stubUser('1', 2));
        expect(db.getById('1')).toMatchObject(stubUser('1', 2));
    });

    it('should delete by id', () => {
        expect(db.getAll()).toHaveLength(0);
        db.create(stubUser('1', 1));
        expect(db.getAll()).toHaveLength(1);
        db.deleteById('1');
        expect(db.getAll()).toHaveLength(0);
    });

    it('should do CRUD', () => {
        // Yes it violates the AAA dogma, but it must be tested in the complex

        expect(db.getAll()).toHaveLength(0);

        //create
        db.create(stubUser('1', 1));
        db.create(stubUser('2', 2));
        db.create(stubUser('3', 3));
        db.create(stubUser('4', 4));

        //read
        expect(db.getAll()).toMatchObject([
            stubUser('1', 1),
            stubUser('2', 2),
            stubUser('3', 3),
            stubUser('4', 4),
        ]);
        expect(db.getById('1')).toMatchObject(stubUser('1', 1));
        expect(db.getById('2')).toMatchObject(stubUser('2', 2));
        expect(db.getById('3')).toMatchObject(stubUser('3', 3));
        expect(db.getById('4')).toMatchObject(stubUser('4', 4));

        //update
        expect(db.update(stubUser('1', 11))).toMatchObject(stubUser('1', 11));
        expect(db.update(stubUser('2', 12))).toMatchObject(stubUser('2', 12));
        expect(db.update(stubUser('3', 13))).toMatchObject(stubUser('3', 13));
        expect(db.update(stubUser('4', 14))).toMatchObject(stubUser('4', 14));

        expect(db.getById('1')).toMatchObject(stubUser('1', 11));
        expect(db.getById('2')).toMatchObject(stubUser('2', 12));
        expect(db.getById('3')).toMatchObject(stubUser('3', 13));
        expect(db.getById('4')).toMatchObject(stubUser('4', 14));

        //delete
        expect(db.getAll()).toHaveLength(4);
        db.deleteById('1');
        expect(db.getAll()).toHaveLength(3);
        db.deleteById('2');
        expect(db.getAll()).toHaveLength(2);
        db.deleteById('3');
        expect(db.getAll()).toHaveLength(1);
        db.deleteById('4');
        expect(db.getAll()).toHaveLength(0);
    })

    it('should throws DbEntryNotFoundError at getById', () => {
        expect(db.getAll()).toHaveLength(0);
        expect(() => db.getById('1')).toThrow(DbEntryNotFoundError);
    });

    it('should throws DbEntryNotFoundError at update', () => {
        expect(db.getAll()).toHaveLength(0);
        expect(() => db.update(stubUser('1', 1))).toThrow(DbEntryNotFoundError);
    });

    it('should throws DbEntryNotFoundError at deleteById', () => {
        expect(db.getAll()).toHaveLength(0);
        expect(() => db.deleteById('1')).toThrow(DbEntryNotFoundError);
    });

    it('should throws DbEntryAlreadyExistError at create', () => {
        expect(db.getAll()).toHaveLength(0);
        db.create(stubUser('1', 1));
        expect(() => db.create(stubUser('1', 1))).toThrow(DbEntryAlreadyExistError);
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

    it('should be DbEntryAlreadyExistError type', () => {
        let e: any = new DbEntryAlreadyExistError();

        const shouldError = e instanceof Error;
        const shouldDbError = e instanceof DbError;

        // suitable for if-else checking
        const shouldDbEntryAlreadyExistError = e instanceof DbEntryAlreadyExistError;

        // suitable for switch-case checking 
        const shouldConstructor = (e.constructor === DbEntryAlreadyExistError);

        expect([shouldError, shouldDbError, shouldDbEntryAlreadyExistError, shouldConstructor])
            .not.toContain(false);
    })
});
