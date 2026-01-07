export interface IBaseRepository<T> {
    create(data: Partial<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    findOne(query: Partial<T>): Promise<T | null>;
    update(id: string, data: Partial<T>): Promise<T | null>;
    delete?(id: string): Promise<boolean>; // Optional for now to avoid breaking others, but I'll implement in Base
}
