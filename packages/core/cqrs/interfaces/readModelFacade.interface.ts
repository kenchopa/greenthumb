export interface ReadModelFacadeInterface<T> {
  getAll(): Promise<T[]>;
  getById(guid: string): Promise<T>;
}
