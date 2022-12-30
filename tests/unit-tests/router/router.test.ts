import http from 'node:http'
import { Router } from '../../../src/router/router';

describe('Router class from router', () => {

    // main Router
    let router: Router;

    // mocks api with hints of expected arguments
    const mockGetUsers = jest.fn((request, response) => undefined);
    const mockGetUserById = jest.fn((request, response, args) => undefined);
    const mockCreateUser = jest.fn((request, response) => undefined);
    const mockUpdateUserById = jest.fn((request, response, args) => undefined);
    const mockDeleteUserById = jest.fn((request, response, args) => undefined);

    beforeAll(() => {
        // Prepare router, set paths and api calls
        // most minimal API see in assignment:
        //   https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md
        router = new Router()
            .on('GET', '/api/users', mockGetUsers)
            .on('GET', '/api/users/{userId}', mockGetUserById)
            .on('POST', '/api/users', mockCreateUser)
            .on('PUT', '/api/users/{userId}', mockUpdateUserById)
            .on('DELETE', '/api/users/{userId}', mockDeleteUserById)
            ;
    });

    beforeEach(() => {
        mockGetUsers.mockClear();
        mockGetUserById.mockClear();
        mockCreateUser.mockClear();
        mockUpdateUserById.mockClear();
        mockDeleteUserById.mockClear();
    });

    it('should call getUsers', () => {
        const request = { method: 'GET', url: '/api/users' } as http.IncomingMessage;
        const response = {} as http.ServerResponse;

        const routeFound = router.do(request, response);

        expect(routeFound).toBeTruthy();
        expect(mockGetUsers).toBeCalledTimes(1);
        expect(mockGetUsers.mock.calls[0]).toMatchObject([request, response]);

        expect(mockGetUserById).not.toBeCalled();
        expect(mockCreateUser).not.toBeCalled();
        expect(mockUpdateUserById).not.toBeCalled();
        expect(mockDeleteUserById).not.toBeCalled();
    });

    it('should call getUserById', () => {
        const request = { method: 'GET', url: '/api/users/12-347' } as http.IncomingMessage;
        const response = {} as http.ServerResponse;

        const routeFound = router.do(request, response);

        expect(routeFound).toBeTruthy();
        expect(mockGetUserById).toBeCalledTimes(1);
        expect(mockGetUserById.mock.calls[0]).toMatchObject([
            request,
            response,
            { userId: '12-347' }
        ]);

        expect(mockGetUsers).not.toBeCalled();
        expect(mockCreateUser).not.toBeCalled();
        expect(mockUpdateUserById).not.toBeCalled();
        expect(mockDeleteUserById).not.toBeCalled();
    });

    it('should call createUser', () => {
        const request = { method: 'POST', url: '/api/users' } as http.IncomingMessage;
        const response = {} as http.ServerResponse;

        const routeFound = router.do(request, response);

        expect(routeFound).toBeTruthy();
        expect(mockCreateUser).toBeCalledTimes(1);
        expect(mockCreateUser.mock.calls[0]).toMatchObject([request, response]);

        expect(mockGetUsers).not.toBeCalled();
        expect(mockGetUserById).not.toBeCalled();
        expect(mockUpdateUserById).not.toBeCalled();
        expect(mockDeleteUserById).not.toBeCalled();
    });

    it('should call updateUserById', () => {
        const request = { method: 'PUT', url: '/api/users/12-347' } as http.IncomingMessage;
        const response = {} as http.ServerResponse;

        const routeFound = router.do(request, response);

        expect(routeFound).toBeTruthy();
        expect(mockUpdateUserById).toBeCalledTimes(1);
        expect(mockUpdateUserById.mock.calls[0]).toMatchObject([
            request,
            response,
            { userId: '12-347' }
        ]);

        expect(mockGetUsers).not.toBeCalled();
        expect(mockGetUserById).not.toBeCalled();
        expect(mockCreateUser).not.toBeCalled();
        expect(mockDeleteUserById).not.toBeCalled();
    });

    it('should call deleteUserById', () => {
        const request = { method: 'DELETE', url: '/api/users/12-347' } as http.IncomingMessage;
        const response = {} as http.ServerResponse;

        const routeFound = router.do(request, response);

        expect(routeFound).toBeTruthy();
        expect(mockDeleteUserById).toBeCalledTimes(1);
        expect(mockDeleteUserById.mock.calls[0]).toMatchObject([
            request,
            response,
            { userId: '12-347' }
        ]);

        expect(mockGetUsers).not.toBeCalled();
        expect(mockGetUserById).not.toBeCalled();
        expect(mockCreateUser).not.toBeCalled();
        expect(mockUpdateUserById).not.toBeCalled();
    });

    it('should not call any api', () => {
        const routeFound = router.do(
            { method: 'GET', url: '/api/users/12-347/123' } as http.IncomingMessage,
            {} as http.ServerResponse
        );

        expect(routeFound).toBeFalsy();
        expect(mockGetUsers).not.toBeCalled();
        expect(mockGetUserById).not.toBeCalled();
        expect(mockCreateUser).not.toBeCalled();
        expect(mockUpdateUserById).not.toBeCalled();
        expect(mockDeleteUserById).not.toBeCalled();
    })

});
