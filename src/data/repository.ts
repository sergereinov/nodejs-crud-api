import { User } from './user'

export interface Repository {

    /**
     * Get all users
     */
    getAll(): User[];

    /**
     * Get user by id
     * 
     * @param userId 
     * @throws DbEntryNotFoundError
     */
    getById(userId: string): User;

    /**
     * Create new user
     * 
     * @param user object to create
     * @returns created user
     * @throws DbEntryAlreadyExistError
     */
    create(user: User): User;

    /**
     * Update user by id
     * 
     * @param user object contains id to find the user and other fields to update them
     * @returns updated user
     * @throws DbEntryNotFoundError
     */
    update(user: User): User;

    /**
     * Delete user by id
     * 
     * @param userId 
     * @throws DbEntryNotFoundError
     */
    deleteById(userId: string): void;
}
