import { v4 as uuidV4 } from 'uuid';

import { CommandInterface } from './interfaces/command.interface';

export default abstract class Command implements CommandInterface {
  public id: string;

  constructor(id?: string) {
    this.id = id || uuidV4();
  }
}
