import http from 'node:http'
import request from 'supertest';
import { NIL as NIL_UUID } from 'uuid';
import { usersBaseUrl } from '../../src/api/baseUrl';
import * as Status from '../../src/api/status';
import * as single from '../../src/single';
import { setLogger } from '../../src/logger/logger';
import { User } from '../../src/data/user';

const partialUser = (factor: number) => ({
    username: `name${factor}`,
    age: factor,
    hobbies: [`hob1/${factor}`, `hob2/${factor}`]
});

describe('1. CRUD operations / good scenario', () => {
    beforeAll(() => setLogger(() => { })); // disable logger

    const host = 'localhost';
    const port = 4000;
    let server: http.Server;

    beforeEach(() => {
        server = single.run(host, port);
    });

    it('get empty users list', async () => {
        await request(server)
            .get(usersBaseUrl)
            .expect(Status.codeOk)
            .expect('Content-Type', /json/)
            .expect([]);
    });

    it('create user', async () => {
        const fakeUser = partialUser(1);
        await request(server)
            .post(usersBaseUrl)
            .send(fakeUser)
            .expect(Status.codeCreated)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body).toHaveProperty('username');
                expect(res.body).toHaveProperty('age');
                expect(res.body).toHaveProperty('hobbies');
            });
    });

    it('get users list', async () => {
        // Prepare DB
        await request(server).get(usersBaseUrl).expect([]);
        const fakeUser = partialUser(1);
        await request(server).post(usersBaseUrl).send(fakeUser).expect(Status.codeCreated)

        // Get users list
        await request(server)
            .get(usersBaseUrl)
            .expect(Status.codeOk)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body).toHaveLength(1);
                expect(res.body[0]).toHaveProperty('id');
                expect(res.body[0]).toHaveProperty('username', fakeUser.username);
                expect(res.body[0]).toHaveProperty('age', fakeUser.age);
                expect(res.body[0]).toHaveProperty('hobbies', fakeUser.hobbies);
            });
    })

    it('get user by id', async () => {
        // Prepare DB
        await request(server).get(usersBaseUrl).expect([]);
        const fakeUser = partialUser(1);
        await request(server).post(usersBaseUrl).send(fakeUser).expect(Status.codeCreated);

        // Accure the id
        const { body } = await request(server).get(usersBaseUrl);
        const users = body as User[];
        expect(users).toHaveLength(1);

        // Get one user by id
        await request(server)
            .get(`${usersBaseUrl}/${users[0].id}`)
            .expect(Status.codeOk)
            .expect('Content-Type', /json/)
            .expect(users[0]);
    });

    it('update user by id', async () => {
        // Prepare DB
        await request(server).get(usersBaseUrl).expect([]);
        const fakeUser = partialUser(1);
        await request(server).post(usersBaseUrl).send(fakeUser).expect(Status.codeCreated);

        // Accure the id
        const { body } = await request(server).get(usersBaseUrl);
        const users = body as User[];
        expect(users).toHaveLength(1);
        const originalUser = users[0];

        // Update user by id
        const fakeUserUpdated = partialUser(2);
        const expectedUser = { ...{ id: originalUser.id }, ...fakeUserUpdated };
        await request(server)
            .put(`${usersBaseUrl}/${originalUser.id}`)
            .send(fakeUserUpdated)
            .expect(Status.codeOk)
            .expect('Content-Type', /json/)
            .expect(expectedUser);
    });

    it('delete user by id', async () => {
        // Prepare DB
        await request(server).get(usersBaseUrl).expect([]);
        const fakeUser = partialUser(1);
        await request(server).post(usersBaseUrl).send(fakeUser).expect(Status.codeCreated);

        // Accure the id
        const { body } = await request(server).get(usersBaseUrl);
        const users = body as User[];
        expect(users).toHaveLength(1);
        const id = users[0].id;

        // Delete by id
        await request(server)
            .delete(`${usersBaseUrl}/${id}`)
            .expect(Status.codeNoContent);

        // Check for DB is empty now
        await request(server).get(usersBaseUrl).expect([]);
    });

});

describe('2. CRUD errors / all required errors', () => {
    beforeAll(() => setLogger(() => { })); // disable logger

    const host = 'localhost';
    const port = 4000;
    let server: http.Server;

    beforeEach(() => {
        server = single.run(host, port);
    });

    it.each`
        userId      | expectedStatus              | text
        ${123}      | ${Status.badRequest().code} | ${Status.badRequest().text}
        ${NIL_UUID} | ${Status.notFound().code}   | ${Status.notFound().text}
    `(`get $userId -> $expectedStatus $text`, async ({ userId, expectedStatus }) => {
        await request(server)
            .get(`${usersBaseUrl}/${userId}`)
            .expect(expectedStatus)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body).toHaveProperty('error', expectedStatus);
                expect(res.body).toHaveProperty('message');
            });
    });

    it.each`
        body      | expectedStatus              | text
        ${'{}'}   | ${Status.badRequest().code} | ${Status.badRequest().text}
        ${'{[,}'} | ${Status.badRequest().code} | ${Status.badRequest().text}
    `(`create $body -> $expectedStatus $text`, async ({ body, expectedStatus }) => {
        await request(server)
            .post(usersBaseUrl)
            .send(body)
            .expect(expectedStatus)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body).toHaveProperty('error', expectedStatus);
                expect(res.body).toHaveProperty('message');
            });
    });

    it.each`
        userId      | body    | expectedStatus              | text
        ${123}      | ${'{}'} | ${Status.badRequest().code} | ${Status.badRequest().text}
        ${NIL_UUID} | ${'{}'} | ${Status.badRequest().code} | ${Status.badRequest().text}
        ${NIL_UUID} | ${'{[,}'} | ${Status.badRequest().code} | ${Status.badRequest().text}
        ${NIL_UUID} | ${'{"username":"u","age":1,"hobbies":[]}'} | ${Status.notFound().code} | ${Status.notFound().text}
    `(`update $userId with $body -> $expectedStatus $text`, async ({ userId, body, expectedStatus }) => {
        await request(server)
            .put(`${usersBaseUrl}/${userId}`)
            .send(body)
            .expect(expectedStatus)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body).toHaveProperty('error', expectedStatus);
                expect(res.body).toHaveProperty('message');
            });
    });

    it.each`
        userId      | expectedStatus              | text
        ${123}      | ${Status.badRequest().code} | ${Status.badRequest().text}
        ${NIL_UUID} | ${Status.notFound().code}   | ${Status.notFound().text}
    `(`delete $userId -> $expectedStatus $text`, async ({ userId, expectedStatus }) => {
        await request(server)
            .delete(`${usersBaseUrl}/${userId}`)
            .expect(expectedStatus)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body).toHaveProperty('error', expectedStatus);
                expect(res.body).toHaveProperty('message');
            });
    });

});


describe('3. CRUD with unknown path', () => {
    beforeAll(() => setLogger(() => { })); // disable logger

    const host = 'localhost';
    const port = 4000;
    let server: http.Server;

    beforeEach(() => {
        server = single.run(host, port);
    });

    it.each`
        path                      | expectedStatus            | text
        ${'/'}                    | ${Status.notFound().code} | ${Status.notFound().text}
        ${'/api'}                 | ${Status.notFound().code} | ${Status.notFound().text}
        ${'/api/other'}           | ${Status.notFound().code} | ${Status.notFound().text}
        ${'/api/users/'}          | ${Status.notFound().code} | ${Status.notFound().text}
        ${'/api/users/123/'}      | ${Status.notFound().code} | ${Status.notFound().text}
        ${'/api/users/123/other'} | ${Status.notFound().code} | ${Status.notFound().text}
    `(`get $path -> $expectedStatus $text`, async ({ path, expectedStatus }) => {
        await request(server)
            .get(path)
            .expect(expectedStatus)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body).toHaveProperty('error', expectedStatus);
                expect(res.body).toHaveProperty('message');
            });
    });

});
