import { User } from './user'

export interface Repository {

    /**
     * Get all users
     */
    getAll(): Promise<User[]>;

    /**
     * Get user by id
     * 
     * @param userId 
     * @throws `DbInvalidEntryError`, `DbEntryNotFoundError`
     */
    getById(userId: string): Promise<User>;

    /**
     * Create new user
     * 
     * @param user object to create
     * @returns created user
     * @throws `DbInvalidEntryError`
     */
    create(user: Partial<User>): Promise<User>;

    /**
     * Update user by id
     * 
     * @param user object contains id to find the user and other fields to update them
     * @returns updated user
     * @throws `DbInvalidEntryError`, `DbEntryNotFoundError`
     */
    update(user: User): Promise<User>;

    /**
     * Delete user by id
     * 
     * @param userId 
     * @throws `DbInvalidEntryError`, `DbEntryNotFoundError`
     */
    deleteById(userId: string): Promise<void>;
}
