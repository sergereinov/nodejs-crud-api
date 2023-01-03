import http from 'node:http';
import { ApiRouter } from './apiRouter';
import { Repository } from '../data/repository';
import { User } from '../data/user';
import { Router } from '../router/router'
import { ApiInvalidInputError, ApiResourceNotFoundError } from './errors';
import * as Status from './status';
import { loadBodyJson } from './request';
import { responseWithCode, responseWithError } from './response';

export class Api implements ApiRouter {
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

    private getUsers = async (request: http.IncomingMessage, response: http.ServerResponse) => {
        try {
            const users = await this.repository.getAll();
            responseWithCode(response, Status.codeOk, users);
        } catch (e) {
            responseWithError(response, e);
        }
    }

    private getUserById = async (request: http.IncomingMessage, response: http.ServerResponse, args: { userId: string }) => {
        try {
            const user = await this.repository.getById(args.userId);
            responseWithCode(response, Status.codeOk, user);
        } catch (e) {
            responseWithError(response, e);
        }
    }

    private createUser = async (request: http.IncomingMessage, response: http.ServerResponse) => {
        try {
            const userProperties = await loadBodyJson(request);
            const user = await this.repository.create(userProperties);
            responseWithCode(response, Status.codeCreated, user);
        } catch (e) {
            responseWithError(response, e);
        }
    }

    private updateUserById = async (request: http.IncomingMessage, response: http.ServerResponse, args: { userId: string }) => {
        try {
            const userProperties = await loadBodyJson(request);
            if ('id' in userProperties) {
                throw new ApiInvalidInputError('invalid body json, id field is redundant');
            }
            const updateUser = { ...userProperties, ...{ id: args.userId } };
            const user = await this.repository.update(updateUser as User);
            responseWithCode(response, Status.codeOk, user);
        } catch (e) {
            responseWithError(response, e);
        }
    }

    private deleteUserById = async (request: http.IncomingMessage, response: http.ServerResponse, args: { userId: string }) => {
        try {
            await this.repository.deleteById(args.userId);
            responseWithCode(response, Status.codeNoContent);
        } catch (e) {
            responseWithError(response, e);
        }
    }

};
