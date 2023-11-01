export interface RepositoryInterface<T> {
  save(aggregateRoot: T, expectedVersion: number): void;
  getById(guid: string): Promise<T>;
}
