import http from 'node:http'
import { Repository } from '../data/repository';
import { User } from '../data/user';
import { Router } from '../router/router'
import { ApiInvalidInputError, ApiResourceNotFoundError } from './errors';
import * as Status from './status';
import { loadBodyJson } from './request';
import { responseWithCode, responseWithError } from './response';

export class Api {
    private router: Router;

    constructor(
        private repository: Repository
    ) {
        this.router = new Router()
            .on('GET', '/api/users', this.getUsers)
            .on('GET', '/api/users/{userId}', this.getUserById)
            .on('POST', '/api/users', this.createUser)
            .on('PUT', '/api/users/{userId}', this.updateUserById)
            .on('DELETE', '/api/users/{userId}', this.deleteUserById)
            ;
    };

    route(request: http.IncomingMessage, response: http.ServerResponse): void {
        if (!this.router.do(request, response)) {
            responseWithError(response, new ApiResourceNotFoundError('requested resource not found'));
        }
    }

    private async getUsers(request: http.IncomingMessage, response: http.ServerResponse) {
        try {
            const users = this.repository.getAll();
            responseWithCode(response, Status.codeOk, users);
        } catch (e) {
            responseWithError(response, e);
        }
    }

    private async getUserById(request: http.IncomingMessage, response: http.ServerResponse, args: { userId: string }) {
        try {
            const user = this.repository.getById(args.userId);
            responseWithCode(response, Status.codeOk, user);
        } catch (e) {
            responseWithError(response, e);
        }
    }

    private async createUser(request: http.IncomingMessage, response: http.ServerResponse) {
        try {
            const userProperties = await loadBodyJson(request);
            const user = this.repository.create(userProperties);
            responseWithCode(response, Status.codeCreated, user);
        } catch (e) {
            responseWithError(response, e);
        }
    }

    private async updateUserById(request: http.IncomingMessage, response: http.ServerResponse, args: { userId: string }) {
        try {
            const userProperties = await loadBodyJson(request);
            if ('id' in userProperties) {
                throw new ApiInvalidInputError('invalid body json, id field is redundant');
            }
            const updateUser = { ...userProperties, ...{ id: args.userId } };
            const user = this.repository.update(updateUser as User);
            responseWithCode(response, Status.codeOk, user);
        } catch (e) {
            responseWithError(response, e);
        }
    }

    private async deleteUserById(request: http.IncomingMessage, response: http.ServerResponse, args: { userId: string }) {
        try {
            this.repository.deleteById(args.userId);
            responseWithCode(response, Status.codeNoContent);
        } catch (e) {
            responseWithError(response, e);
        }
    }

};
