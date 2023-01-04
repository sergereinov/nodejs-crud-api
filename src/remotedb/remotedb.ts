import http from 'node:http';
import { Repository } from '../data/repository';
import { User } from '../data/user';
import { queryRAPI } from './request';

export class RemoteUsersDb implements Repository {

    /**
     * Partially precofigured options for http requests, see docs at {@link http.RequestOptions}
     */
    private options: object;

    constructor(
        host: string,
        port: number
    ) {
        // Preconfig the options
        this.options = {
            hostname: host,
            port: port,
            headers: {
                'Content-Type': 'application/json'
            }
        };

    }

    async getAll(): Promise<User[]> {
        const users = await queryRAPI(this.options, 'GET', '/api/users') as User[];
        return users;
    }

    async getById(userId: string): Promise<User> {
        const user = await queryRAPI(this.options, 'GET', `/api/users/${userId}`) as User;
        return user;
    }

    async create(userProperties: Partial<User>): Promise<User> {
        const user = await queryRAPI(this.options, 'POST', `/api/users`, userProperties) as User;
        return user;
    }

    async update(user: User): Promise<User> {
        const userId = user.id;
        const userProperties: Omit<User, 'id'> = user;
        const userResult = await queryRAPI(this.options, 'PUT', `/api/users/${userId}`, userProperties) as User;
        return userResult;
    }

    async deleteById(userId: string): Promise<void> {
        await queryRAPI(this.options, 'DELETE', `/api/users/${userId}`);
    }
}
